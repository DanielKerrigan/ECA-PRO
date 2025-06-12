<script lang="ts">
	import type {
		Data,
		OralTreatmentEvent,
		PROKeyToResponses,
		PROUserConstructOrders,
		TreatmentEvent
	} from '../../shared/api';
	import Header from './Header.svelte';
	import type { AggregationLevel } from './pro/aggregation';
	import PROTable from './pro/PROTable.svelte';
	import { ascending, max, min } from 'd3-array';
	import { timeDay, timeMonth } from 'd3-time';
	import TreatmentsTable from './treatments/TreatmentsTable.svelte';

	let { data }: { data: Data } = $props();

	let patientID: number | undefined = $state();
	let patientResponses: PROKeyToResponses | undefined = $state();
	let proPatientConstructs: PROUserConstructOrders | undefined = $state();
	let radiationTreatment: TreatmentEvent[] | undefined = $state();
	let systemicTherapyTreatment: TreatmentEvent[] | undefined = $state();
	let oralTreatment: OralTreatmentEvent[] | undefined = $state();
	let minDate: Date | undefined = $state();
	let maxDate: Date | undefined = $state();
	let startDate: Date | undefined = $state();
	let endDate: Date | undefined = $state();
	let aggregationLevel: AggregationLevel = $state('none');
	let normalizeBars: boolean = $state(false);

	const patientIDs = $derived(Array.from(data.proUsersResponses.keys()).sort(ascending));

	function onChangePatient(newPatientID: number) {
		patientID = newPatientID;
		patientResponses = data.proUsersResponses.get(patientID);
		proPatientConstructs = data.proUsersConstructOrders.get(patientID);
		radiationTreatment = data.radiationTreatmentByUser.get(patientID);
		systemicTherapyTreatment = data.systemicTherapyTreatmentByUser.get(patientID);
		oralTreatment = data.oralTreatmentByUser.get(patientID);

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

	function onChangeNormalizeBars(normalize: boolean) {
		normalizeBars = normalize;
	}
</script>

<div class="flex h-full w-full flex-col gap-4">
	<div class="flex-none">
		<Header
			{patientIDs}
			{patientID}
			{startDate}
			{endDate}
			{minDate}
			{maxDate}
			{aggregationLevel}
			{normalizeBars}
			{onChangePatient}
			{onChangeDates}
			{onChangeAggregationLevel}
			{onChangeNormalizeBars}
		/>
	</div>
	{#if radiationTreatment && systemicTherapyTreatment && oralTreatment && startDate && endDate}
		<div class="min-h-0 flex-none">
			<TreatmentsTable
				{radiationTreatment}
				{systemicTherapyTreatment}
				{oralTreatment}
				{startDate}
				{endDate}
				{aggregationLevel}
			/>
		</div>
	{/if}
	{#if patientResponses && proPatientConstructs && startDate && endDate}
		<div class="min-h-0 flex-1">
			<PROTable
				proKeyToResponses={patientResponses}
				proMetaByKey={data.proMetaByKey}
				{proPatientConstructs}
				{startDate}
				{endDate}
				{aggregationLevel}
				{normalizeBars}
			/>
		</div>
	{/if}
</div>
