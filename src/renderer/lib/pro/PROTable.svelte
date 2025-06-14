<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type {
		PROKeyToResponses,
		PROUserConstructOrders,
		PROConstructOrderMethod,
		PROMetaByKey
	} from '../../../shared/api';
	import PROTimeline from './PROTimeline.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '../utils';
	import PROTableSymptomFilter from './PROTableSymptomFilter.svelte';
	import PROTableSymptomOrdering from './PROTableSymptomOrdering.svelte';
	import PROTimelineStackedBars from './PROTimelineStackedBars.svelte';
	import type { AggregationLevel } from './aggregation';
	import { getPROMetaByConstruct } from './symptoms.svelte';
	import ProSymptomInfo from './PROSymptomInfo.svelte';
	import Info from '@lucide/svelte/icons/info';

	let {
		proMetaByKey,
		proKeyToResponses,
		proPatientConstructs,
		startDate,
		endDate,
		aggregationLevel,
		normalizeBars
	}: {
		proMetaByKey: PROMetaByKey;
		proKeyToResponses: PROKeyToResponses;
		proPatientConstructs: PROUserConstructOrders;
		startDate: Date;
		endDate: Date;
		aggregationLevel: AggregationLevel;
		normalizeBars: boolean;
	} = $props();

	const keys = $derived(Array.from(proKeyToResponses.keys()));
	let filteredKeys: string[] = $derived($state.snapshot(keys));
	let orderMethod: PROConstructOrderMethod = $state('category');
	let constructsOrder = $derived(proPatientConstructs[orderMethod]);

	const proMetaByConstruct = $derived(getPROMetaByConstruct(proMetaByKey, filteredKeys));

	let visWidth = $state(0);
</script>

<div
	class="table-container grid max-h-full gap-px overflow-y-auto border border-neutral-200 bg-neutral-200"
>
	<div class="sticky top-0 z-10 flex gap-1 bg-neutral-200 px-2 py-1 uppercase">
		<div class="font-semibold">Symptom</div>

		<PROTableSymptomFilter
			{proMetaByKey}
			keys={Array.from(proKeyToResponses.keys())}
			onFilterItems={(keys) => {
				filteredKeys = keys;
			}}
		/>

		<PROTableSymptomOrdering
			{orderMethod}
			proUserConstructOrders={proPatientConstructs}
			onChangeOrderMethod={(method) => {
				orderMethod = method;
			}}
		/>
	</div>
	<div class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase">PRO Measure</div>
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
				<div class="flex items-center gap-1 bg-white px-2 py-1">
					<div class="flex flex-col">
						{#if item.bankName.toLocaleLowerCase() !== item.responseItemType.toLocaleLowerCase()}
							<div>{item.bankName}</div>
						{/if}
						<div>{item.responseItemType}</div>
					</div>

					<Popover.Root>
						<Popover.Trigger
							class={cn([buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-6'])}
						>
							<Info class="size-4" />
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
							responses={proKeyToResponses.get(item.key) ?? []}
							width={visWidth}
							{startDate}
							{endDate}
						/>
					{:else}
						<PROTimelineStackedBars
							{item}
							{aggregationLevel}
							responses={proKeyToResponses.get(item.key) ?? []}
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
			12rem
			12rem
			minmax(0, 1fr);
	}
</style>
