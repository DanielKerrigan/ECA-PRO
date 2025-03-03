<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type {
		PROItem,
		PROMetaByCategoryConstruct,
		PROMetaByID,
		PROItemToResponses
	} from '../../../shared/api';
	import PROTimeline from './PROTimeline.svelte';
	import PROLegend from './PROLegend.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '../utils';
	import PROTableSymptomFilter from './PROTableSymptomFilter.svelte';
	import PROTimelineAggregatedLine from './PROTimelineAggregatedLine.svelte';
	import PROTimelineStackedBars from './PROTimelineStackedBars.svelte';
	import type { AggregationLevel } from './aggregation';
	import { getPROMetaByConstruct } from './grouping';

	let {
		proMetaByCategoryConstruct,
		proMetaByID,
		proItemToResponses,
		startDate,
		endDate,
		aggregationLevel,
		chartType,
		normalizeBars
	}: {
		proMetaByCategoryConstruct: PROMetaByCategoryConstruct;
		proMetaByID: PROMetaByID;
		proItemToResponses: PROItemToResponses;
		startDate: Date;
		endDate: Date;
		aggregationLevel: AggregationLevel;
		chartType: string;
		normalizeBars: boolean;
	} = $props();

	const itemIDs = $derived(Array.from(proItemToResponses.keys()));
	let filteredItemIDs: number[] = $state([]);

	// TODO: Is there a way to do this without using $effect?
	$effect(() => {
		filteredItemIDs = itemIDs;
	});

	const proMetaByConstruct: [string, PROItem[]][] = $derived(
		getPROMetaByConstruct(proMetaByID, filteredItemIDs)
	);

	let visWidth = $state(0);
</script>

<div
	class="table-container grid h-full w-full grid-cols-3 gap-px overflow-y-auto border border-neutral-200 bg-neutral-200"
>
	<div class="sticky top-0 z-10 flex gap-1 bg-neutral-200 px-2 py-1 uppercase">
		<div class="font-semibold">Symptom</div>

		<PROTableSymptomFilter
			{proMetaByID}
			itemIDs={Array.from(proItemToResponses.keys())}
			onFilterItems={(ids) => {
				filteredItemIDs = ids;
			}}
		/>

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
						d="M3 7.5 7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5"
					/>
				</svg>
			</Popover.Trigger>
			<Popover.Content class="w-80"></Popover.Content>
		</Popover.Root>
	</div>
	<div class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase">Attribute</div>
	<div
		class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase"
		bind:clientWidth={visWidth}
	>
		Values
	</div>
	{#each proMetaByConstruct as [construct, items]}
		<div style:grid-row={`span ${items.length}`} class="flex items-center bg-white px-2 py-1">
			{construct}
		</div>
		{#each items as item}
			<div class="flex items-center bg-white px-2 py-1">
				<Popover.Root>
					<Popover.Trigger
						class={cn([buttonVariants({ variant: 'outline' }), 'font-normal', 'text-base'])}
						>{item.responseItemType}</Popover.Trigger
					>
					<Popover.Content class="w-fit">
						<PROLegend {item} />
					</Popover.Content>
				</Popover.Root>
			</div>
			<div class="bg-white">
				{#if aggregationLevel === 'none'}
					<PROTimeline
						{item}
						responses={proItemToResponses.get(item.itemID) ?? []}
						width={visWidth}
						{startDate}
						{endDate}
					/>
				{:else if chartType === 'line'}
					<PROTimelineAggregatedLine
						{item}
						{aggregationLevel}
						responses={proItemToResponses.get(item.itemID) ?? []}
						width={visWidth}
						{startDate}
						{endDate}
					/>
				{:else}
					<PROTimelineStackedBars
						{item}
						{aggregationLevel}
						responses={proItemToResponses.get(item.itemID) ?? []}
						{normalizeBars}
						width={visWidth}
						{startDate}
						{endDate}
					/>
				{/if}
			</div>
		{/each}
	{/each}
</div>

<style>
	.table-container {
		grid-template-columns:
			minmax(min-content, 4rem)
			minmax(min-content, 4rem)
			minmax(0, 1fr);
	}
</style>
