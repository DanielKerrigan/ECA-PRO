<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import Info from '@lucide/svelte/icons/info';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '../utils';
	import { schemeDark2 } from 'd3-scale-chromatic';
	import type { AggregationLevel } from '$lib/aggregation';

	let {
		aggregationLevel
	}: {
		aggregationLevel: AggregationLevel;
	} = $props();
</script>

<Popover.Root>
	<Popover.Trigger class={cn([buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-6'])}>
		<Info class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="w-fit max-w-sm">
		{#if aggregationLevel === 'none'}
			<div>
				When the aggregation level is {aggregationLevel}, each rectangle represents one treatment
				event. A <span style:color={schemeDark2[3]}>pink</span> outline indicates a missed treatment.
				For oral treatment, each rectangle spans from the start date to the discontinued date.
			</div>
		{:else}
			<div>
				When the aggregation level is {aggregationLevel}, each rectangle indicates that at least one
				treatment occurred during that {aggregationLevel.slice(0, -2)}, except for oral treatments,
				where each rectangle spans from the start date to the discontinued date.
			</div>
		{/if}
	</Popover.Content>
</Popover.Root>
