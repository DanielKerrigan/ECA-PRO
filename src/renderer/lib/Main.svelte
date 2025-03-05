<script lang="ts">
	import type { Data, PROItemToResponses, PROUserConstructOrders } from '../../shared/api';
	import Header from './Header.svelte';
	import type { AggregationLevel } from './pro/aggregation';
	import PROTable from './pro/PROTable.svelte';
	import { ascending, max, min } from 'd3-array';
	import { timeDay, timeMonth } from 'd3-time';

	let { data }: { data: Data } = $props();

	let patientID: number | undefined = $state();
	let patientResponses: PROItemToResponses | undefined = $state();
	let proPatientConstructs: PROUserConstructOrders | undefined = $state();
	let minDate: Date | undefined = $state();
	let maxDate: Date | undefined = $state();
	let startDate: Date | undefined = $state();
	let endDate: Date | undefined = $state();
	let aggregationLevel: AggregationLevel = $state('none');
	let chartType: string = $state('stacked-bars');
	let normalizeBars: boolean = $state(false);

	const patientIDs = $derived(Array.from(data.proUsersResponses.keys()).sort(ascending));

	function onChangePatient(newPatientID: number) {
		patientID = newPatientID;
		patientResponses = data.proUsersResponses.get(patientID);
		proPatientConstructs = data.proUsersConstructOrders.get(patientID);

		if (patientResponses === undefined) {
			minDate = undefined;
			maxDate = undefined;
		} else {
			const minDateTime = min(patientResponses.values(), (responses) =>
				min(responses, (response) => response.dateTime)
			);
			minDate = minDateTime === undefined ? undefined : timeDay.floor(minDateTime);

			const maxDateTime = max(patientResponses.values(), (responses) =>
				max(responses, (response) => response.dateTime)
			);
			// TODO: this should be timeDay.ceil(maxDateTime)?
			maxDate = maxDateTime === undefined ? undefined : timeDay.floor(maxDateTime);
		}

		if (minDate && maxDate) {
			const idealStart = timeMonth.offset(maxDate, -3);
			startDate = idealStart >= minDate ? idealStart : minDate;
			endDate = maxDate;
		}
	}

	function onChangeDates(start: Date, end: Date) {
		startDate = new Date(start);
		endDate = new Date(end);
	}

	function onChangeAggregationLevel(level: AggregationLevel) {
		aggregationLevel = level;
	}

	function onChangeChartType(ct: string) {
		chartType = ct;
	}

	function onChangeNormalizeBars(normalize: boolean) {
		normalizeBars = normalize;
	}
</script>

<div class="flex h-full w-full flex-col gap-4">
	<Header
		{patientIDs}
		{patientID}
		{startDate}
		{endDate}
		{minDate}
		{maxDate}
		{aggregationLevel}
		{chartType}
		{normalizeBars}
		{onChangePatient}
		{onChangeDates}
		{onChangeAggregationLevel}
		{onChangeChartType}
		{onChangeNormalizeBars}
	/>
	{#if patientResponses && proPatientConstructs && startDate && endDate}
		<PROTable
			proItemToResponses={patientResponses}
			proMetaByID={data.proMetaByID}
			{proPatientConstructs}
			{startDate}
			{endDate}
			{aggregationLevel}
			{chartType}
			{normalizeBars}
		/>
	{/if}
</div>
