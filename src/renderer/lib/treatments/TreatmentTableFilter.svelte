<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { cn } from '../utils';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import Filter from '@lucide/svelte/icons/filter';
	import CheckboxFilter from '$lib/components/ui/checkbox-filter/CheckboxFilter.svelte';
	import type { CheckboxFilterData } from '$lib/components/ui/checkbox-filter/index.svelte';
	import type { GroupedTreatments } from '../../../shared/api';

	let {
		groupedTreatments,
		onFilter
	}: {
		groupedTreatments: GroupedTreatments;
		onFilter: (keys: string[]) => void;
	} = $props();

	const data: CheckboxFilterData = $state(
		groupedTreatments.map(([category, detailAndEvents]) => ({
			name: category,
			children: detailAndEvents.map(([detail]) => ({
				name: detail,
				keys: [`${category}_${detail}`]
			}))
		}))
	);
</script>

<Popover.Root>
	<Popover.Trigger class={cn([buttonVariants({ variant: 'ghost' }), 'size-6 p-0'])}>
		<Filter class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="w-96" align="start">
		<CheckboxFilter {data} {onFilter} title="Treatment Filters" />
	</Popover.Content>
</Popover.Root>
