import { groups } from 'd3-array';
import type { PROMetaByID, PROItem } from '../../../shared/api';

export type PROMetaByConstruct = [string, PROItem[]][];

export function getPROMetaByConstruct(
	proMetaByID: PROMetaByID,
	itemIDs: number[]
): PROMetaByConstruct {
	const items = itemIDs
		.map((itemID: number) => proMetaByID.get(itemID))
		.filter((d) => d !== undefined);

	return groups(items, (d) => d.constructName);
}

export type PROMetaByCategoryAndConstruct = [string, [string, PROItem[]][]][];

export function getPROMetaByCategoryAndConstruct(
	proMetaByID: PROMetaByID,
	itemIDs: number[]
): PROMetaByCategoryAndConstruct {
	const items = itemIDs
		.map((itemID: number) => proMetaByID.get(itemID))
		.filter((d) => d !== undefined);

	return groups(
		items,
		(d) => d.categoryName,
		(d) => d.constructName
	);
}
