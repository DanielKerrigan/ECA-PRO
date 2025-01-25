<script lang="ts">
	import type { PROMeta, PROUsersResponses } from '../../shared/api';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ascending } from 'd3-array';
	import DateRangeInputs from './DateRangeInputs.svelte';

	let {
		proMeta,
		proUsersResponses,
		patientID,
		onChangePatient,
		startDate,
		endDate,
		minDate,
		maxDate,
		onChangeDates
	}: {
		proMeta: PROMeta;
		proUsersResponses: PROUsersResponses;
		patientID: number | undefined;
		onChangePatient: (newPatientID: number) => void;
		startDate: Date | undefined;
		endDate: Date | undefined;
		minDate: Date | undefined;
		maxDate: Date | undefined;
		onChangeDates: (start: Date, end: Date) => void;
	} = $props();

	const patiendIDs = $derived(
		Array.from(proUsersResponses.keys())
			.sort(ascending)
			.map((d) => d.toString())
	);
	const triggerContent = $derived(patientID ?? 'Select a patient');
</script>

<div class="flex flex-none items-center gap-8">
	<div class="flex flex-none items-center gap-2">
		<Label for="patient-select" class="text-base">Patient</Label>
		<Select.Root
			type="single"
			value={patientID === undefined ? undefined : patientID.toString()}
			onValueChange={(value) => {
				onChangePatient(+value);
			}}
		>
			<Select.Trigger id="patient-select" class="w-[180px]">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				{#each patiendIDs as patientID}
					<Select.Item value={patientID} label={patientID} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if startDate && endDate && minDate && maxDate}
		<DateRangeInputs {startDate} {endDate} {minDate} {maxDate} {onChangeDates} />
	{/if}
</div>
