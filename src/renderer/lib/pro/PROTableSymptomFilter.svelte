<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { PROMetaByKey } from '../../../shared/api';
	import { cn } from '../utils';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import { CategoryChecks } from './symptoms.svelte';
	import Button from '$lib/components/ui/button/button.svelte';
	import Filter from '@lucide/svelte/icons/filter';

	let {
		proMetaByKey,
		keys,
		onFilterItems
	}: {
		proMetaByKey: PROMetaByKey;
		keys: string[];
		onFilterItems: (keys: string[]) => void;
	} = $props();

	const checks: CategoryChecks = $derived(new CategoryChecks(proMetaByKey, keys));

	let searchValue = $state('');

	function onSearchChanged(value: string) {
		searchValue = value;
		checks.updateShow(value);
	}

	function onCheckedChange() {
		onFilterItems(checks.getCheckedKeys());
	}

	function onSetAll(checked: boolean) {
		checks.setAll(checked);
		onCheckedChange();
	}
</script>

<Popover.Root>
	<Popover.Trigger class={cn([buttonVariants({ variant: 'ghost' }), 'size-6 p-0'])}>
		<Filter class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="w-96" align="start">
		<div class="flex min-h-0 flex-col gap-2">
			<div class="text-lg font-bold">Symptom Filters</div>
			<Input
				class="h-8 px-3 py-2"
				value={searchValue}
				oninput={(event) => onSearchChanged(event.currentTarget.value.toLowerCase())}
			/>
			<div class="flex gap-1">
				<Button
					variant="secondary"
					class="h-auto px-2 py-1 text-base font-normal"
					onclick={() => onSetAll(true)}
				>
					Select All
				</Button>
				<Button
					variant="secondary"
					class="h-auto px-2 py-1 text-base font-normal"
					onclick={() => onSetAll(false)}
				>
					Clear All
				</Button>
			</div>
			<div class="flex max-h-96 min-h-0 flex-col overflow-auto">
				{#each checks.categories as category, categoryIndex}
					{#if category.show}
						<div class="flex flex-none items-center gap-2">
							<Checkbox
								id="pro-filter-check-{categoryIndex}"
								bind:checked={category.checked}
								indeterminate={category.indeterminate}
								{onCheckedChange}
								aria-labelledby="pro-filter-label-{categoryIndex}"
							/>
							<Label
								id="pro-filter-label-{categoryIndex}"
								for="pro-filter-check-{categoryIndex}"
								class="text-base"
							>
								{category.name}
							</Label>
						</div>
						<div class="pl-6">
							{#each category.constructs as construct, constructIndex}
								{#if construct.show}
									<div class="flex flex-none items-center gap-2">
										<Checkbox
											id="pro-filter-check-{categoryIndex}-{constructIndex}"
											bind:checked={construct.checked}
											{onCheckedChange}
											aria-labelledby="pro-filter-label-{categoryIndex}-{constructIndex}"
										/>
										<Label
											id="pro-filter-label-{categoryIndex}-{constructIndex}"
											for="pro-filter-check-{categoryIndex}-{constructIndex}"
											class="text-base"
										>
											{construct.name}
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
