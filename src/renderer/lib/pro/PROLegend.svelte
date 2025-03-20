<script lang="ts">
	import type { PROItem } from '../../../shared/api';
	import { getPROColor } from '$lib/vis-utils';

	let {
		item
	}: {
		item: PROItem;
	} = $props();

	const I = $derived([
		...item.responseItemValues.slice(0, -1).reverse(),
		item.responseItemValues[item.responseItemValues.length - 1]
	]);
</script>

<div>
	{#each I as i}
		<div class="flex items-center gap-2">
			<div
				class="h-4 w-4"
				style:background-color={getPROColor(item.normalizedResponseItemValues[i])}
			></div>
			<div>{item.responseItemStrings[i]}</div>
		</div>
	{/each}
</div>
