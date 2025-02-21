<script lang="ts">
	import type { PROItem } from '../../../shared/api';
	import { getPROColor } from '$lib/vis-utils';

	let {
		item
	}: {
		item: PROItem;
	} = $props();
</script>

{#snippet swatch(value: number, item: PROItem)}
	<div class="flex items-center gap-2">
		<div class="h-4 w-4" style:background-color={getPROColor(value, item.responseItemValues)}></div>
		<div>{item.responseItemStrings[value]}</div>
	</div>
{/snippet}

<div>
	{#each item.responseItemValues.slice(1, -1).reverse() as value}
		{@render swatch(value, item)}
	{/each}
	{@render swatch(0, item)}
	{@render swatch(item.responseItemValues.length - 1, item)}
</div>
