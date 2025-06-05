import { ascending, groups, InternMap, rollup, rollups } from 'd3-array';
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
	).toSorted((a, b) => ascending(a[0], b[0]));
}

// filtering

export class ConstructCheck {
	name = $state('');
	checked = $state(true);
	show = $state(true);
	keys: string[] = $state([]);

	constructor(name: string, keys: string[]) {
		this.name = name;
		this.keys = keys;
	}
}

export class CategoryCheck {
	name: string = $state('');
	show: boolean = $state(true);
	constructs: ConstructCheck[] = $state([]);
	#checked: boolean = $derived(this.constructs.some((d) => d.checked));
	indeterminate: boolean = $derived(
		this.constructs.some((d, _, arr) => d.checked !== arr[0].checked)
	);

	constructor(name: string, constructs: ConstructCheck[]) {
		this.name = name;
		this.constructs = constructs;
	}

	set checked(value: boolean) {
		this.constructs.forEach((construct) => {
			construct.checked = value;
		});
	}

	get checked(): boolean {
		return this.#checked;
	}

	updateShow(search: string) {
		this.constructs.forEach((construct) => {
			construct.show = construct.name.toLowerCase().includes(search);
		});
		this.show = this.name.toLowerCase().includes(search) || this.constructs.some((d) => d.show);
	}
}

export class CategoryChecks {
	categories: CategoryCheck[] = $state([]);

	constructor(proMetaByID: PROMetaByKey, keys: string[]) {
		const proMetaByCategoryConstruct = getPROMetaByCategoryAndConstruct(proMetaByID, keys);
		this.categories = proMetaByCategoryConstruct.map(([categoryName, constructAndItems]) => {
			const constructs = constructAndItems.map(
				([constructName, items]) =>
					new ConstructCheck(
						constructName,
						items.map((d) => d.key)
					)
			);

			return new CategoryCheck(categoryName, constructs);
		});
	}

	getCheckedKeys(): string[] {
		return this.categories
			.map((category) =>
				category.constructs
					.filter((construct) => construct.checked)
					.map((construct) => construct.keys)
			)
			.flat(2);
	}

	updateShow(search: string) {
		this.categories.forEach((category) => {
			category.updateShow(search);
		});
	}

	setAll(checked: boolean) {
		this.categories.forEach((category) => {
			category.checked = checked;
		});
	}
}
