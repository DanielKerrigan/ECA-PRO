import { ascending, InternMap, rollup, rollups } from 'd3-array';
import type { PROMetaByKey, MergedPROItem } from '../../../shared/api';

// grouping

export type PROMetaByConstruct = InternMap<string, MergedPROItem[]>;

export function getPROMetaByConstruct(
	proMetaByKey: PROMetaByKey,
	keys: string[]
): PROMetaByConstruct {
	const items = keys.map((key: string) => proMetaByKey.get(key)).filter((d) => d !== undefined);

	return rollup(
		items,
		(g) => g.toSorted((a, b) => ascending(a.responseItemType, b.responseItemType)),
		(d) => d.constructName
	);
}

export type PROMetaByCategoryAndConstruct = [string, [string, MergedPROItem[]][]][];

export function getPROMetaByCategoryAndConstruct(
	proMetaByKey: PROMetaByKey,
	keys: string[]
): PROMetaByCategoryAndConstruct {
	const items = keys.map((key: string) => proMetaByKey.get(key)).filter((d) => d !== undefined);

	return rollups(
		items,
		(g) => g.toSorted((a, b) => ascending(a.constructName, b.constructName)),
		(d) => d.categoryName,
		(d) => d.constructName
	);
}
