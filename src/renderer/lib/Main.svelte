<script lang="ts">
	import type { PROItemToResponses, PROMeta, PROUsersResponses } from '../../shared/api';
	import Header from './Header.svelte';
	import PROTable from './PROTable.svelte';
	import { min, max } from 'd3-array';
	import { timeDay, timeMonth } from 'd3-time';

	let {
		proMeta,
		proUsersResponses
	}: {
		proMeta: PROMeta;
		proUsersResponses: PROUsersResponses;
	} = $props();

	let patientID: number | undefined = $state();
	let patientResponses: PROItemToResponses | undefined = $state();
	let minDate: Date | undefined = $state();
	let maxDate: Date | undefined = $state();
	let startDate: Date | undefined = $state();
	let endDate: Date | undefined = $state();

	function onChangePatient(newPatientID: number) {
		patientID = newPatientID;
		patientResponses = proUsersResponses.get(patientID);

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
</script>

<div class="flex h-full w-full flex-col gap-4">
	<Header
		{proMeta}
		{proUsersResponses}
		{patientID}
		{onChangePatient}
		{startDate}
		{endDate}
		{minDate}
		{maxDate}
		{onChangeDates}
	/>
	{#if patientResponses && startDate && endDate}
		<PROTable proItemToResponses={patientResponses} {proMeta} {startDate} {endDate} />
	{/if}
</div>
