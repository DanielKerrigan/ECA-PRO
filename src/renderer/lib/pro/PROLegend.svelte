<script lang="ts">
	import type { MergedProItem } from '../../../shared/api';
	import { getProColor } from '$lib/vis-utils';
	import { descending } from 'd3-array';

	let {
		item
	}: {
		item: MergedProItem;
	} = $props();

	const entries = $derived(
		Array.from(
			item.textToValue.entries().map(([text, value]) => ({
				text,
				normalizedValue: item.valueToNormalizedValue.get(value) ?? -1
			}))
		).sort((a, b) => descending(a.normalizedValue, b.normalizedValue))
	);
</script>

<div>
	{#each entries as { text, normalizedValue }}
		<div class="flex items-center gap-2">
			<div class="h-4 w-4" style:background-color={getProColor(normalizedValue)}></div>
			<div>{text}</div>
		</div>
	{/each}
</div>
