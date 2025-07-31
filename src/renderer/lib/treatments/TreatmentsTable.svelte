<script lang="ts">
	import * as d3 from 'd3';
	import TreatmentTimeline from './TreatmentTimeline.svelte';
	import TreatmentTableFilter from './TreatmentTableFilter.svelte';
	import type { GroupedTreatments, TreatmentEvent } from '../../../shared/api';

	let {
		treatmentEvents,
		startDate,
		endDate,
		aggregationLevel
	}: {
		treatmentEvents: TreatmentEvent[];
		startDate: Date;
		endDate: Date;
		aggregationLevel: 'none' | 'weekly' | 'monthly';
	} = $props();

	const groupedTreatments: GroupedTreatments = $derived(
		d3.groups(
			treatmentEvents,
			(d) => d.category,
			(d) => d.detail
		)
	);

	$inspect(groupedTreatments);

	const keys = $derived(
		groupedTreatments
			.map(([category, detailAndEvents]) =>
				detailAndEvents.map(([detail]) => `${category}_${detail}`)
			)
			.flat()
	);
	let filteredKeys: string[] = $derived($state.snapshot(keys));

	const filteredGroupedTreatments: GroupedTreatments = $derived(
		groupedTreatments
			.map(([category, detailAndEvents]): GroupedTreatments[number] => [
				category,
				detailAndEvents.filter(([detail]) => filteredKeys.includes(`${category}_${detail}`))
			])
			.filter(([, detailAndEvents]) => detailAndEvents.length > 0)
	);

	let visWidth = $state(0);
</script>

<div
	class="table-container grid h-full w-full gap-px overflow-y-auto border border-neutral-200 bg-neutral-200"
>
	<div class="sticky top-0 z-10 flex gap-1 bg-neutral-200 px-2 py-1 uppercase">
		<div class="font-semibold">Treatment</div>
		<TreatmentTableFilter {groupedTreatments} onFilter={(keys) => (filteredKeys = keys)} />
	</div>
	<div class="sticky top-0 z-10 flex gap-1 bg-neutral-200 px-2 py-1 font-semibold uppercase">
		Detail
	</div>
	<div
		class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase"
		bind:clientWidth={visWidth}
	>
		Events
	</div>
	{#each filteredGroupedTreatments as [category, detailAndEvents]}
		<div
			style:grid-row={`span ${detailAndEvents.length}`}
			class="flex items-center bg-white px-2 py-1"
		>
			{category}
		</div>
		{#each detailAndEvents as [detail, events]}
			<div class="flex items-center bg-white px-2 py-1">
				{detail}
			</div>
			<div class="flex items-center bg-white">
				{#if aggregationLevel === 'none'}
					<TreatmentTimeline {events} width={visWidth} {startDate} {endDate} />
				{:else}
					<TreatmentTimeline {events} width={visWidth} {startDate} {endDate} />
				{/if}
			</div>
		{/each}
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
