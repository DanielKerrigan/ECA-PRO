<script lang="ts">
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import type { CheckboxFilterData } from './index.svelte';
	import { ParentChecks } from './index.svelte';

	let {
		data,
		onFilter,
		title = 'Filters'
	}: {
		data: CheckboxFilterData;
		onFilter: (keys: string[]) => void;
		title?: string;
	} = $props();

	const uid = $props.id();

	const checks: ParentChecks = $derived(new ParentChecks(data));

	let searchValue = $state('');

	function onSearchChanged(value: string) {
		searchValue = value;
		checks.updateShow(value);
	}

	function onCheckedChange() {
		onFilter(checks.getCheckedKeys());
	}

	function onSetAll(checked: boolean) {
		checks.setAll(checked);
		onCheckedChange();
	}
</script>

<div class="flex min-h-0 flex-col gap-2">
	<div class="text-lg font-bold">{title}</div>
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
		{#each checks.parents as parent, parentIndex}
			{#if parent.show}
				<div class="flex flex-none items-center gap-2">
					<Checkbox
						id="filter-check-{uid}-{parentIndex}"
						bind:checked={parent.checked}
						indeterminate={parent.indeterminate}
						{onCheckedChange}
						aria-labelledby="filter-label-{uid}-{parentIndex}"
					/>
					<Label
						id="filter-label-{uid}-{parentIndex}"
						for="filter-check-{uid}-{parentIndex}"
						class="text-base"
					>
						{parent.name}
					</Label>
				</div>
				<div class="pl-6">
					{#each parent.children as child, childIndex}
						{#if child.show}
							<div class="flex flex-none items-center gap-2">
								<Checkbox
									id="filter-check-{uid}-{parentIndex}-{childIndex}"
									bind:checked={child.checked}
									{onCheckedChange}
									aria-labelledby="filter-label-{uid}-{parentIndex}-{childIndex}"
								/>
								<Label
									id="filter-label-{uid}-{parentIndex}-{childIndex}"
									for="filter-check-{uid}-{parentIndex}-{childIndex}"
									class="text-base"
								>
									{child.name}
								</Label>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		{/each}
	</div>
</div>
