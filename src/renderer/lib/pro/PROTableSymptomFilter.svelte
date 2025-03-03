<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { PROMetaByID } from '../../../shared/api';
	import { cn } from '../utils';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { getPROMetaByCategoryAndConstruct } from './grouping';

	let {
		proMetaByID,
		itemIDs,
		onFilterItems
	}: {
		proMetaByID: PROMetaByID;
		itemIDs: number[];
		onFilterItems: (itemsIDs: number[]) => void;
	} = $props();

	type ConstructCheck = {
		constructName: string;
		checked: boolean;
		show: boolean;
		itemIDs: number[];
	};

	type CategoryCheck = {
		categoryName: string;
		indeterminate: boolean;
		checked: boolean;
		show: boolean;
		constructs: ConstructCheck[];
	};

	let categories: CategoryCheck[] = $state([]);

	function getCheckedItemIDs(): number[] {
		return categories
			.map((category) =>
				category.constructs
					.filter((construct) => construct.checked)
					.map((construct) => construct.itemIDs)
			)
			.flat(2);
	}

	function initializeCategories(itemIDs: number[]): CategoryCheck[] {
		const proMetaByCategoryConstruct = getPROMetaByCategoryAndConstruct(proMetaByID, itemIDs);

		return proMetaByCategoryConstruct.map(([categoryName, constructs]) => ({
			categoryName,
			indeterminate: false,
			checked: true,
			show: true,
			constructs: constructs.map(([constructName, items]) => ({
				constructName,
				checked: true,
				show: true,
				itemIDs: items.map((d) => d.itemID)
			}))
		}));
	}

	// TODO: Is there a way to do this without using $effect?
	$effect(() => {
		categories = initializeCategories(itemIDs);
	});

	function onChangeCategory(category: CategoryCheck, checked: boolean) {
		category.indeterminate = false;

		category.constructs.forEach((construct) => {
			construct.checked = checked;
		});

		onFilterItems(getCheckedItemIDs());
	}

	function onChangeConstruct(category: CategoryCheck, construct: ConstructCheck, checked: boolean) {
		category.indeterminate = category.constructs.some(
			(d) => d.checked !== category.constructs[0].checked
		);

		if (!category.indeterminate) {
			category.checked = category.constructs[0].checked;
		}

		onFilterItems(getCheckedItemIDs());
	}

	function onChangeSearch(value: string) {
		categories.forEach((category) => {
			category.constructs.forEach((construct) => {
				construct.show = construct.constructName.includes(value);
			});
			category.show = category.categoryName.includes(value);
		});
	}
</script>

<Popover.Root>
	<Popover.Trigger class={cn([buttonVariants({ variant: 'ghost' }), 'size-6 p-0'])}>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z"
			/>
		</svg>
	</Popover.Trigger>
	<Popover.Content class="w-80" align="start">
		<div class="flex min-h-0 flex-col gap-2">
			<div class="text-lg font-bold">Symptom Filters</div>
			<Input
				class="h-8 px-3 py-2"
				onchange={(event) => onChangeSearch(event.currentTarget.value)}
			/>
			<div class="flex max-h-96 min-h-0 flex-col overflow-auto">
				{#each categories as category, i}
					{#if category.show}
						<div class="flex flex-none items-center gap-2">
							<Checkbox
								id="pro-filter-check-{i}"
								bind:checked={category.checked}
								bind:indeterminate={category.indeterminate}
								onCheckedChange={(checked) => onChangeCategory(category, checked)}
								aria-labelledby="pro-filter-label-{i}"
							/>
							<Label id="pro-filter-label-{i}" for="pro-filter-check-{i}" class="text-base">
								{category.categoryName}
							</Label>
						</div>
						<div class="pl-6">
							{#each category.constructs as construct, j}
								{#if construct.show}
									<div class="flex flex-none items-center gap-2">
										<Checkbox
											id="pro-filter-check-{i}-{j}"
											bind:checked={construct.checked}
											onCheckedChange={(checked) => onChangeConstruct(category, construct, checked)}
											aria-labelledby="pro-filter-label-{i}-{j}"
										/>
										<Label
											id="pro-filter-label-{i}-{j}"
											for="pro-filter-check-{i}-{j}"
											class="text-base"
										>
											{construct.constructName}
										</Label>
									</div>
								{/if}
							{/each}
						</div>
					{/if}
				{/each}
			</div>
		</div>
	</Popover.Content>
</Popover.Root>
