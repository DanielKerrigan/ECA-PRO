import type { PROMetaByID, PROItem } from '../../shared/api.js';

import * as d3 from 'd3';

export function getPROItems(metaContents: string): PROItem[] {
	return d3
		.csvParse(metaContents, (d, index) => {
			const responseItemStrings = d.ResponseItemValues.split('|').map((s) => s.trim());
			const numResponses = responseItemStrings.length;

			const responseItemValues = d3.range(numResponses);

			// Normalize the response value between 0 to 1, with "Prefer not to say" as -1.
			// This assumes that in responseItemStrings, the values go from
			// best to worst with "Prefer not to say" at the end.

			const normalizedResponseItemValues = [
				...responseItemValues.slice(0, -1).map((d) => d / (numResponses - 2)),
				-1
			];

			return {
				index,
				itemID: +d.ItemID,
				item: d.Item,
				constructName: d.ConstructName,
				responseItemType: d.ResponseItemType,
				responseItemStrings,
				responseItemValues,
				normalizedResponseItemValues,
				bankName: d.BankName,
				categoryName: d.CategoryName
			};
		})
		.filter((d) => d.item !== '');
}

export function groupPROItems(proItems: PROItem[]): PROMetaByID {
	return d3.index(proItems, (d) => d.itemID);
}
