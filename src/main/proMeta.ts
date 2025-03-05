import type { PROMetaByID, PROItem } from '../shared/api.js';

import * as d3 from 'd3';

export function getPROItems(metaContents: string): PROItem[] {
	return d3
		.csvParse(metaContents, (d, index) => {
			const responseItemStrings = d.ResponseItemValues.split('|').map((s) => s.trim());
			const responseItemValues = d3.range(responseItemStrings.length);

			return {
				index,
				itemID: +d.ItemID,
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

export function groupPROItems(proItems: PROItem[]): PROMetaByID {
	return d3.index(proItems, (d) => d.itemID);
}
