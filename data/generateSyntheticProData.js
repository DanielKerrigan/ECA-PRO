import * as fs from 'fs/promises';
import * as d3 from 'd3';

// format for reading dates
const parseDate = d3.timeParse('%Y-%m-%d');

// make sure x is in the range [min, max]
function clamp(x, min, max) {
	return Math.max(min, Math.min(x, max));
}

// from https://github.com/sindresorhus/strip-bom
// see https://d3js.org/d3-dsv#byte-order-marks for more info
function stripBom(str) {
	if (typeof str !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof str}`);
	}

	// Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
	// conversion translates it to FEFF (UTF-16 BOM).
	if (str.charCodeAt(0) === 0xfeff) {
		return str.slice(1);
	}

	return str;
}

// read the PRO meta data and return an array of its items
function getProMetaItems(proMetaContent) {
	return d3
		.csvParse(stripBom(proMetaContent), (d) => {
			const responseItemStrings = d.ResponseItemValues.split('|').map((s) => s.trim());
			const responseItemValues = d3.range(responseItemStrings.length);

			return {
				// adding a key
				key: d.ConstructName + d.ResponseItemType,
				itemID: d.ItemID,
				item: d.Item,
				constructName: d.ConstructName,
				responseItemType: d.ResponseItemType,
				responseItemStrings,
				responseItemValues,
				bankName: d.BankName,
				categoryName: d.CategoryName
			};
		})
		.filter((d) => d.item !== '');
}

// read the oral treatment data and return the min and max date for each patient
function getMinMaxOralDates(oralContent) {
	const rows = d3.csvParse(stripBom(oralContent), (d) => {
		const id = d['ECA ID'];
		const start = parseDate(d['oral_start']);
		const end = parseDate(d['oral_stopdt']);
		return { id, dates: [start, end] };
	});

	return d3.rollup(
		rows,
		(g) => {
			const dates = g.flatMap((d) => d.dates);
			return d3.extent(dates);
		},
		(d) => d['id']
	);
}

// read the radiation treatment data and return the min and max date for each patient
function getMinMaxRadiationDates(radiationContent) {
	const rows = d3.csvParse(stripBom(radiationContent), (d) => {
		const id = d['ECA ID'];
		const date = parseDate(d['Date of radiation appointment']);
		return { id, date };
	});

	return d3.rollup(
		rows,
		(g) => {
			return d3.extent(g, (d) => d.date);
		},
		(d) => d['id']
	);
}

// read the systemic therapy data and return the min and max date for each patient
function getMinMaxSystemicTherapyDates(systemicTherapyContent) {
	const rows = d3.csvParse(stripBom(systemicTherapyContent), (d) => {
		const id = d['ECA ID'];
		const date = parseDate(d['Treatment date']);
		return { id, date };
	});

	return d3.rollup(
		rows,
		(g) => {
			return d3.extent(g, (d) => d.date);
		},
		(d) => d['id']
	);
}

// get the min and max treatment dates for each patient
function getMinMaxTreatmentDates(oralContent, radiationContent, systemicTherapyContent) {
	const oralDates = getMinMaxOralDates(oralContent);
	const radiationDates = getMinMaxRadiationDates(radiationContent);
	const systemicDates = getMinMaxSystemicTherapyDates(systemicTherapyContent);

	const ids = d3.union(oralDates.keys(), radiationDates.keys(), systemicDates.keys());

	const users = [];

	for (const userID of ids) {
		const dates = [
			oralDates.get(userID),
			radiationDates.get(userID),
			systemicDates.get(userID)
		].flat();

		users.push({
			userID,
			startDate: d3.min(dates),
			endDate: d3.max(dates)
		});
	}

	return users;
}

Promise.all([
	fs.readFile('pro-meta.csv', 'utf8'),
	fs.readFile('treatment-oral.csv', 'utf8'),
	fs.readFile('treatment-radiation.csv', 'utf8'),
	fs.readFile('treatment-systemic-therapy.csv', 'utf8')
]).then((values) => {
	const [proMetaContent, oralContent, radiationContent, systemicTherapyContent] = values;

	const meta = getProMetaItems(proMetaContent);
	const users = getMinMaxTreatmentDates(oralContent, radiationContent, systemicTherapyContent);

	const formatDate = d3.timeFormat('%Y-%m-%d %H:%M:%S');

	const data = [];

	const keyToItems = d3.group(meta, (d) => d.key);

	// for each user in the mock treatment data, generate PRO responses
	for (const { userID, startDate, endDate } of users) {
		// array of date times for the user to respond
		const dates = d3.timeDay
			.range(startDate, d3.timeDay.offset(endDate, 1))
			.map((d) => {
				// add some randomness to their response time
				const offsetSeconds = d3.randomInt(60 * 60 * 12)();
				return d3.timeSecond.offset(d, offsetSeconds);
			})
			// have them skip 10% of the time
			.filter(() => Math.random() > 0.1);

		for (const items of keyToItems.values()) {
			const item = items[0];
			let previousResponseIndex = d3.randomInt(item.responseItemValues.length - 1)();
			const randomChange = d3.randomInt(-1, 2);
			const maxResponseIndex = item.responseItemValues.length - 2;
			const didNotRespondIndex = item.responseItemValues.length - 1;
			const randomItemIndex = d3.randomInt(0, items.length);

			for (const date of dates) {
				const responseIndex =
					Math.random() < 0.1
						? didNotRespondIndex
						: clamp(previousResponseIndex + randomChange(), 0, maxResponseIndex);

				if (responseIndex !== didNotRespondIndex) {
					previousResponseIndex = responseIndex;
				}

				const d = {
					UserID: userID,
					DateTime: formatDate(date),
					ItemID: items[randomItemIndex()].itemID,
					ResponseValue: item.responseItemValues[responseIndex],
					ResponseText: item.responseItemStrings[responseIndex]
				};
				data.push(d);
			}
		}
	}

	fs.writeFile('pro-data.csv', d3.csvFormat(data), 'utf8');
});
