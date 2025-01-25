<script lang="ts">
	import type { PROResponse, PROItem, PROMeta, PROItemToResponses } from '../../shared/api';
	import PROTimeline from './PROTimeline.svelte';

	let {
		proMeta,
		proItemToResponses,
		startDate,
		endDate
	}: {
		proMeta: PROMeta;
		proItemToResponses: PROItemToResponses;
		startDate: Date;
		endDate: Date;
	} = $props();

	let visWidth = $state(0);
</script>

<div
	class="table-container grid h-full w-full grid-cols-3 gap-px overflow-y-auto border border-neutral-200 bg-neutral-200"
>
	<div class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase">Symptom</div>
	<div class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase">Attribute</div>
	<div
		class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase"
		bind:clientWidth={visWidth}
	>
		Values
	</div>
	{#each proMeta as [_, constructToItems]}
		{#each constructToItems as [construct, items]}
			<div style:grid-row={`span ${items.length}`} class="flex items-center bg-white px-2 py-1">
				{construct}
			</div>
			{#each items as item}
				<div class="flex items-center bg-white px-2 py-1">{item.responseItemType}</div>
				<div class="bg-white">
					<PROTimeline
						{item}
						responses={proItemToResponses.get(item.itemID) ?? []}
						width={visWidth}
						{startDate}
						{endDate}
					/>
				</div>
			{/each}
		{/each}
	{/each}
</div>

<style>
	.table-container {
		grid-template-columns:
			minmax(min-content, 4rem)
			minmax(min-content, 4rem)
			minmax(0, 1fr);
	}
</style>
