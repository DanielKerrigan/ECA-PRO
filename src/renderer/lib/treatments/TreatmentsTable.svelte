<script lang="ts">
	import * as d3 from 'd3';
	import type { OralTreatmentEvent, TreatmentEvent } from '../../../shared/api';
	import TreatmentTimeline from './TreatmentTimeline.svelte';

	let {
		radiationTreatment,
		systemicTherapyTreatment,
		oralTreatment,
		startDate,
		endDate,
		aggregationLevel
	}: {
		radiationTreatment: TreatmentEvent[];
		systemicTherapyTreatment: TreatmentEvent[];
		oralTreatment: OralTreatmentEvent[];
		startDate: Date;
		endDate: Date;
		aggregationLevel: 'none' | 'weekly' | 'monthly';
	} = $props();

	const groupedRadiation = $derived(
		d3.groups(
			radiationTreatment,
			(d) => d.treatment,
			(d) => d.detail
		)
	);

	const groupedSystemicTherapy = $derived(
		d3.groups(
			systemicTherapyTreatment,
			(d) => d.treatment,
			(d) => d.detail
		)
	);

	let visWidth = $state(0);
</script>

<div
	class="table-container grid h-full w-full gap-px overflow-y-auto border border-neutral-200 bg-neutral-200"
>
	<div class="sticky top-0 z-10 flex gap-1 bg-neutral-200 px-2 py-1 font-semibold uppercase">
		Treatment
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
	{#each groupedRadiation as [treatment, detailAndEvents]}
		<div
			style:grid-row={`span ${detailAndEvents.length}`}
			class="flex items-center bg-white px-2 py-1"
		>
			{treatment}
		</div>
		{#each detailAndEvents as [detail, events]}
			<div class="flex items-center bg-white px-2 py-1">
				{detail}
			</div>
			<div class="bg-white">
				{#if aggregationLevel === 'none'}
					<TreatmentTimeline {events} width={visWidth} {startDate} {endDate} />
				{:else}
					<TreatmentTimeline {events} width={visWidth} {startDate} {endDate} />
				{/if}
			</div>
		{/each}
	{/each}

	{#each groupedSystemicTherapy as [treatment, detailAndEvents]}
		<div
			style:grid-row={`span ${detailAndEvents.length}`}
			class="flex items-center bg-white px-2 py-1"
		>
			{treatment}
		</div>
		{#each detailAndEvents as [detail, events]}
			<div class="flex items-center bg-white px-2 py-1">
				{detail}
			</div>
			<div class="bg-white">
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
