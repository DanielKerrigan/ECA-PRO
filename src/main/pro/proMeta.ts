import type { ProItem, FileResults, ProItemByKey } from '../../shared/api.js';
import { getFileData, zodInteger, zodNonEmptyString } from '../utils.js';
import {
	notApplicable,
	notSexuallyActive,
	preferNotToSay,
	specialTextToValue
} from '../../shared/utils.js';

import * as d3 from 'd3';
import { z } from 'zod';

export function getProItemSchema(): z.ZodType<ProItem> {
	const Schema = z
		.object({
			ItemID: zodInteger(),
			Item: zodNonEmptyString(),
			ConstructName: zodNonEmptyString(),
			ResponseItemType: zodNonEmptyString(),
			ResponseItemValues: zodNonEmptyString()
				.transform((d) => d.split('|').map((s) => s.trim()))
				.pipe(
					z
						.array(z.string().min(1, 'Values in "ReponseItemValues" cannot be empty'))
						.min(3, '"ResponseItemValues" must have at least three values')
						.refine(
							(v) => v[v.length - 1] === preferNotToSay,
							`Last value in "ReponseItemValues" must be "${preferNotToSay}"`
						)
						.refine((v) => {
							const naIndex = v.indexOf(notApplicable);
							return naIndex === -1 || naIndex === v.length - 2;
						}, `Second to last value in "ReponseItemValues" is expected to be "${notApplicable}"`)
						.refine((v) => {
							const naIndex = v.indexOf(notSexuallyActive);
							return naIndex === -1 || naIndex === v.length - 2;
						}, `Second to last value in "ReponseItemValues" is expected to be "${notSexuallyActive}"`)
				),
			BankName: zodNonEmptyString(),
			CategoryName: zodNonEmptyString()
		})
		.transform((d): ProItem => {
			const I = d3.range(d.ResponseItemValues.length);
			const values = d.ResponseItemValues.map((s, i) => specialTextToValue[s] ?? i);
			const maxValue = Math.max(...values);
			const normalizedValues = values.map((v) => (v < 0 ? v : v / maxValue));

			const textToValue = new Map(I.map((i) => [d.ResponseItemValues[i], values[i]]));
			const valueToNormalizedValue = new Map(I.map((i) => [values[i], normalizedValues[i]]));

			return {
				key: `${d.ConstructName}_${d.ResponseItemType}`,
				itemId: d.ItemID,
				item: d.Item,
				constructName: d.ConstructName,
				responseItemType: d.ResponseItemType,
				bankName: d.BankName,
				categoryName: d.CategoryName,
				textToValue,
				valueToNormalizedValue
			};
		});

	return Schema;
}

export function getProItems(contents: string): FileResults<ProItem> {
	const Schema = getProItemSchema();
	return getFileData(contents, Schema);
}

export function getProItemById(proItems: ProItem[]): Map<number, ProItem> {
	return new Map(proItems.map((d) => [d.itemId, d]));
}

export function getProItemIdToKey(proItems: ProItem[]): Map<number, string> {
	return new Map(proItems.map((d) => [d.itemId, d.key]));
}

export function mergeProItems(proItems: ProItem[]): ProItemByKey {
	return d3.rollup(
		proItems,
		(g) => {
			const itemIds = g.map((d) => d.itemId);
			const items = g.map((d) => d.item);

			const i = d3.greatestIndex(itemIds)!;
			const item = g[i];

			return {
				key: item.key,
				itemIds: itemIds,
				items,
				constructName: item.constructName,
				responseItemType: item.responseItemType,
				bankName: item.bankName,
				categoryName: item.categoryName,
				textToValue: item.textToValue,
				valueToNormalizedValue: item.valueToNormalizedValue
			};
		},
		(d) => d.key
	);
}
