import { ascending, InternMap, rollup, rollups } from 'd3-array';
import type { ProItemByKey, MergedProItem } from '../../../shared/api';

// grouping

export type ProMetaByConstruct = InternMap<string, MergedProItem[]>;

export function getProMetaByConstruct(
	proMetaByKey: ProItemByKey,
	keys: string[]
): ProMetaByConstruct {
	const items = keys.map((key: string) => proMetaByKey.get(key)).filter((d) => d !== undefined);

	return rollup(
		items,
		(g) => g.toSorted((a, b) => ascending(a.responseItemType, b.responseItemType)),
		(d) => d.constructName
	);
}

export type ProMetaByCategoryAndConstruct = [string, [string, MergedProItem[]][]][];

export function getProMetaByCategoryAndConstruct(
	proMetaByKey: ProItemByKey,
	keys: string[]
): ProMetaByCategoryAndConstruct {
	const items = keys.map((key: string) => proMetaByKey.get(key)).filter((d) => d !== undefined);

	return rollups(
		items,
		(g) => g.toSorted((a, b) => ascending(a.constructName, b.constructName)),
		(d) => d.categoryName,
		(d) => d.constructName
	);
}
