import * as fs from 'fs';
import * as d3 from 'd3';

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

	const userIDs = d3.range(0, 5);

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
		for (const date of dates) {
			for (const item of meta) {
				const randomIndex = d3.randomInt(item.responseItemValues.length)();
				const d = {
					UserID: userID,
					DateTime: dateFormat(date),
					ItemID: item.itemID,
					ResponseValue: item.responseItemValues[randomIndex],
					ResponseText: item.responseItemStrings[randomIndex]
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
