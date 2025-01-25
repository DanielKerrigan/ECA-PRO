<script lang="ts">
	import DateInput from './DateInput.svelte';

	let {
		startDate,
		endDate,
		minDate,
		maxDate,
		onChangeDates
	}: {
		startDate: Date;
		endDate: Date;
		minDate: Date;
		maxDate: Date;
		onChangeDates: (start: Date, end: Date) => void;
	} = $props();
</script>

<div class="flex flex-none items-center gap-4">
	<label class="flex items-center gap-2">
		<span class="font-medium">Start Date</span>
		<DateInput
			date={startDate}
			min={minDate}
			max={endDate}
			onchange={(date) => onChangeDates(date, endDate)}
		/>
	</label>
	<label class="flex items-center gap-2">
		<span class="font-medium">End Date</span>
		<DateInput
			date={endDate}
			min={startDate}
			max={maxDate}
			onchange={(date) => onChangeDates(startDate, date)}
		/>
	</label>
</div>
