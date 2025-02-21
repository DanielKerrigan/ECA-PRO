<script lang="ts">
	import { timeFormat, timeParse } from 'd3-time-format';

	let {
		date,
		min,
		max,
		onchange
	}: {
		date: Date;
		min: Date;
		max: Date;
		onchange: (date: Date) => void;
	} = $props();

	const specifier = '%Y-%m-%d';
	const formatDate = timeFormat(specifier);
	const parseDate = timeParse(specifier);

	function getDate(): string {
		return formatDate(date);
	}

	function setDate(value: string) {
		let newDate = parseDate(value);

		if (newDate === null) {
			return;
		}

		if (newDate < min) newDate = min;
		if (newDate > max) newDate = max;

		onchange(newDate);
	}
</script>

<input type="date" min={formatDate(min)} max={formatDate(max)} bind:value={getDate, setDate} />
