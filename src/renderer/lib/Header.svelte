<script lang="ts">
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import DateRangeInputs from '$lib/components/ui/DateRangeInputs.svelte';
	import { aggregationLevels, type AggregationLevel } from './pro/aggregation';
	import { capitalize } from './utils';

	let {
		patientIDs,
		patientID,
		startDate,
		endDate,
		minDate,
		maxDate,
		aggregationLevel,
		chartType,
		normalizeBars,
		onChangePatient,
		onChangeDates,
		onChangeAggregationLevel,
		onChangeChartType,
		onChangeNormalizeBars
	}: {
		patientIDs: number[];
		patientID: number | undefined;
		startDate: Date | undefined;
		endDate: Date | undefined;
		minDate: Date | undefined;
		maxDate: Date | undefined;
		aggregationLevel: AggregationLevel;
		chartType: string;
		normalizeBars: boolean;
		onChangePatient: (newPatientID: number) => void;
		onChangeDates: (start: Date, end: Date) => void;
		onChangeAggregationLevel: (level: AggregationLevel) => void;
		onChangeChartType: (chartType: string) => void;
		onChangeNormalizeBars: (normalize: boolean) => void;
	} = $props();

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
			<Select.Trigger id="patient-select" class="w-fit">
				{triggerContent}
			</Select.Trigger>
			<Select.Content>
				{#each patientIDs as patientID}
					<Select.Item value={patientID.toString()} label={patientID.toString()} />
				{/each}
			</Select.Content>
		</Select.Root>
	</div>

	{#if startDate && endDate && minDate && maxDate}
		<DateRangeInputs {startDate} {endDate} {minDate} {maxDate} {onChangeDates} />

		<div class="flex flex-none items-center gap-2">
			<Label for="aggregation-select" class="text-base">Aggregation</Label>
			<Select.Root
				type="single"
				value={aggregationLevel}
				onValueChange={(value) => {
					onChangeAggregationLevel(value as AggregationLevel);
				}}
			>
				<Select.Trigger id="aggregation-select" class="w-fit">
					{capitalize(aggregationLevel)}
				</Select.Trigger>
				<Select.Content>
					{#each aggregationLevels as level}
						<Select.Item value={level} label={capitalize(level)} />
					{/each}
				</Select.Content>
			</Select.Root>
		</div>

		{#if aggregationLevel !== 'none'}
			<div class="flex flex-none items-center gap-2">
				<Label for="chart-select" class="text-base">Chart Type</Label>
				<Select.Root
					type="single"
					value={chartType}
					onValueChange={(value) => {
						onChangeChartType(value);
					}}
				>
					<Select.Trigger id="chart-select" class="w-fit">
						{chartType}
					</Select.Trigger>
					<Select.Content>
						<Select.Item value={'stacked-bar'} label={'stacked-bar'} />
						<Select.Item value={'line'} label={'line'} />
					</Select.Content>
				</Select.Root>
			</div>

			{#if chartType === 'stacked-bar'}
				<div class="flex flex-none items-center gap-2">
					<Checkbox
						id="normalize-select"
						checked={normalizeBars}
						onCheckedChange={onChangeNormalizeBars}
						aria-labelledby="normalize-label"
					/>
					<Label id="normalize-label" for="normalize-select" class="text-base">Normalize</Label>
				</div>
			{/if}
		{/if}
	{/if}
</div>
