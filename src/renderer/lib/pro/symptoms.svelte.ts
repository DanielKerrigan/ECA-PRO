import { groups, InternMap, rollup } from 'd3-array';
import type { PROMetaByID, PROItem } from '../../../shared/api';

// grouping

export type PROMetaByConstruct = InternMap<string, PROItem[]>;

export function getPROMetaByConstruct(
	proMetaByID: PROMetaByID,
	itemIDs: number[]
): PROMetaByConstruct {
	const items = itemIDs
		.map((itemID: number) => proMetaByID.get(itemID))
		.filter((d) => d !== undefined);

	return rollup(
		items,
		(g) => g.toSorted((a, b) => a.index - b.index),
		(d) => d.constructName
	);
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

// filtering

export class ConstructCheck {
	name = $state('');
	checked = $state(true);
	show = $state(true);
	itemIDs: number[] = $state([]);

	constructor(name: string, itemIDs: number[]) {
		this.name = name;
		this.itemIDs = itemIDs;
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

	reset(proMetaByID: PROMetaByID, itemIDs: number[]) {
		const proMetaByCategoryConstruct = getPROMetaByCategoryAndConstruct(proMetaByID, itemIDs);
		this.categories = proMetaByCategoryConstruct.map(([categoryName, constructAndItems]) => {
			const constructs = constructAndItems.map(
				([constructName, items]) =>
					new ConstructCheck(
						constructName,
						items.map((d) => d.itemID)
					)
			);

			return new CategoryCheck(categoryName, constructs);
		});
	}

	getCheckedItemIDs(): number[] {
		return this.categories
			.map((category) =>
				category.constructs
					.filter((construct) => construct.checked)
					.map((construct) => construct.itemIDs)
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
