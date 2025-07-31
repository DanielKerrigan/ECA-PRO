<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { PROMetaByKey } from '../../../shared/api';
	import { cn } from '../utils';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Filter from '@lucide/svelte/icons/filter';
	import CheckboxFilter from '$lib/components/ui/checkbox-filter/CheckboxFilter.svelte';
	import type { CheckboxFilterData } from '$lib/components/ui/checkbox-filter/index.svelte';
	import { getPROMetaByCategoryAndConstruct } from './symptoms.svelte';
	import { ascending } from 'd3-array';

	let {
		proMetaByKey,
		keys,
		onFilter
	}: {
		proMetaByKey: PROMetaByKey;
		keys: string[];
		onFilter: (keys: string[]) => void;
	} = $props();

	const proMetaByCategoryConstruct = $derived(getPROMetaByCategoryAndConstruct(proMetaByKey, keys));

	const data: CheckboxFilterData = $derived(
		proMetaByCategoryConstruct
			.map(([categoryName, constructAndItems]) => {
				const children = constructAndItems
					.map(([constructName, items]) => ({
						name: constructName,
						keys: items.map((d) => d.key)
					}))
					.toSorted((a, b) => ascending(a.name, b.name));

				return {
					name: categoryName,
					children
				};
			})
			.toSorted((a, b) => ascending(a.name, b.name))
	);
</script>

<Popover.Root>
	<Popover.Trigger class={cn([buttonVariants({ variant: 'ghost' }), 'size-6 p-0'])}>
		<Filter class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="w-96" align="start">
		<CheckboxFilter {data} {onFilter} title="Symptom Filters" />
	</Popover.Content>
</Popover.Root>
