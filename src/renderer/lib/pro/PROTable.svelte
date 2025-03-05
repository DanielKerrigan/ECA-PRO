<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type {
		PROMetaByID,
		PROItemToResponses,
		PROUserConstructOrders,
		PROConstructOrderKey
	} from '../../../shared/api';
	import PROTimeline from './PROTimeline.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '../utils';
	import PROTableSymptomFilter from './PROTableSymptomFilter.svelte';
	import PROTableSymptomSorting from './PROTableSymptomSorting.svelte';
	import PROTimelineAggregatedLine from './PROTimelineAggregatedLine.svelte';
	import PROTimelineStackedBars from './PROTimelineStackedBars.svelte';
	import type { AggregationLevel } from './aggregation';
	import { getPROMetaByConstruct } from './symptoms.svelte';
	import ProSymptomInfo from './PROSymptomInfo.svelte';
	import Info from 'lucide-svelte/icons/info';

	let {
		proMetaByID,
		proItemToResponses,
		proPatientConstructs,
		startDate,
		endDate,
		aggregationLevel,
		chartType,
		normalizeBars
	}: {
		proMetaByID: PROMetaByID;
		proItemToResponses: PROItemToResponses;
		proPatientConstructs: PROUserConstructOrders;
		startDate: Date;
		endDate: Date;
		aggregationLevel: AggregationLevel;
		chartType: string;
		normalizeBars: boolean;
	} = $props();

	const itemIDs = $derived(Array.from(proItemToResponses.keys()));
	let filteredItemIDs: number[] = $state([]);
	let sortingKey: PROConstructOrderKey = $state('category');
	let constructsOrder = $derived(proPatientConstructs[sortingKey]);

	// TODO: Is there a way to do this without using $effect?
	$effect(() => {
		filteredItemIDs = itemIDs;
		sortingKey = 'category';
	});

	const proMetaByConstruct = $derived(getPROMetaByConstruct(proMetaByID, filteredItemIDs));

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

		<PROTableSymptomSorting
			{sortingKey}
			proUserConstructOrders={proPatientConstructs}
			onChangeSortingKey={(key) => {
				sortingKey = key;
			}}
		/>
	</div>
	<div class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase">Attribute</div>
	<div
		class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase"
		bind:clientWidth={visWidth}
	>
		Values
	</div>
	{#each constructsOrder.order as construct}
		{@const items = proMetaByConstruct.get(construct)}
		{#if items}
			<div style:grid-row={`span ${items.length}`} class="flex items-center bg-white px-2 py-1">
				{construct}
			</div>
			{#each items as item}
				<div class="flex items-center bg-white px-2 py-1">
					<div>{item.responseItemType}</div>
					<Popover.Root>
						<Popover.Trigger
							class={cn([buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-6'])}
						>
							<Info class="size-6" />
						</Popover.Trigger>
						<Popover.Content class="w-fit max-w-sm">
							<ProSymptomInfo {item} />
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
		{/if}
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
