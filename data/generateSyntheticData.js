import * as fs from 'fs';
import * as d3 from 'd3';

function clamp(x, min, max) {
	return Math.max(min, Math.min(x, max));
}

fs.readFile('META.csv', 'utf8', (err, contents) => {
	if (err) {
		console.error(err);
		return;
	}

	const meta = d3
		.csvParse(contents, (d) => {
			const responseItemStrings = d.ResponseItemValues.split('|').map((s) => s.trim());
			const responseItemValues = d3.range(responseItemStrings.length);

			return {
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

	const userIDs = [0, 1];

	const dateSpecifier = '%Y-%m-%d %H:%M:%S';
	const dateFormat = d3.timeFormat(dateSpecifier);

	const startDate = new Date(2022, 0, 1);
	const endDate = new Date(2024, 11, 31);

	const data = [];

	for (const userID of userIDs) {
		const dates = d3.timeDay
			.range(startDate, endDate)
			.map((d) => {
				const offsetSeconds = d3.randomInt(60 * 60 * 12)();
				return d3.timeSecond.offset(d, offsetSeconds);
			})
			.filter(() => Math.random() > 0.1);

		for (const item of meta) {
			let previousResponseIndex = d3.randomInt(item.responseItemValues.length - 1)();
			let randomChange = d3.randomInt(-1, 2);
			const maxResponseIndex = item.responseItemValues.length - 2;
			const didNotRespondIndex = item.responseItemValues.length - 1;
			for (const date of dates) {
				const index =
					Math.random() < 0.1
						? didNotRespondIndex
						: clamp(previousResponseIndex + randomChange(), 0, maxResponseIndex);

				if (index !== didNotRespondIndex) {
					previousResponseIndex = index;
				}

				const d = {
					UserID: userID,
					DateTime: dateFormat(date),
					ItemID: item.itemID,
					ResponseValue: item.responseItemValues[index],
					ResponseText: item.responseItemStrings[index]
				};
				data.push(d);
			}
		}
	}

	const csvString = d3.csvFormat(data);
	fs.writeFile('DATA.csv', csvString, 'utf8', (err) => {
		if (err) {
			console.error(err);
		}
	});
});
