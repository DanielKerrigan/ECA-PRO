import type { PROItem, PROMetaByKey } from '../../shared/api.js';

import * as d3 from 'd3';

export function getPROItems(metaContents: string): PROItem[] {
	return d3
		.csvParse(metaContents, (d) => {
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
				key: `${d.ConstructName}_${d.ResponseItemType}`,
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

export function getPROItemIDToKey(proItems: PROItem[]): Map<number, string> {
	return new Map(proItems.map((d) => [d.itemID, d.key]));
}

export function mergePROItems(proItems: PROItem[]): PROMetaByKey {
	return d3.rollup(
		proItems,
		(g) => {
			const itemIDs = g.map((d) => d.itemID);
			const items = g.map((d) => d.key);

			const first = g[0];

			return {
				key: first.key,
				itemIDs,
				items,
				constructName: first.constructName,
				responseItemType: first.responseItemType,
				responseItemStrings: first.responseItemStrings,
				responseItemValues: first.responseItemValues,
				normalizedResponseItemValues: first.normalizedResponseItemValues,
				bankName: first.bankName,
				categoryName: first.categoryName
			};
		},
		(d) => d.key
	);
}
