<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import type { RadiationTreatment } from '../../../shared/api';
	import TreatmentTimeline from './TreatmentTimeline.svelte';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import { cn } from '../utils';
	import Info from 'lucide-svelte/icons/info';

	let {
		radiationTreatment,
		startDate,
		endDate,
		aggregationLevel
	}: {
		radiationTreatment: RadiationTreatment;
		startDate: Date;
		endDate: Date;
		aggregationLevel: 'none' | 'weekly' | 'monthly';
	} = $props();

	let visWidth = $state(0);
</script>

<div
	class="table-container grid h-full w-full gap-px overflow-y-auto border border-neutral-200 bg-neutral-200"
>
	<div class="sticky top-0 z-10 flex gap-1 bg-neutral-200 px-2 py-1 font-semibold uppercase">
		Treatment
	</div>
	<div
		class="sticky top-0 z-10 bg-neutral-200 px-2 py-1 font-semibold uppercase"
		bind:clientWidth={visWidth}
	>
		Events
	</div>
	<div class="flex items-center gap-1 bg-white px-2 py-1">
		<div class="">Radiation</div>

		<Popover.Root>
			<Popover.Trigger class={cn([buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-6'])}>
				<Info class="size-6" />
			</Popover.Trigger>
			<Popover.Content class="w-fit max-w-sm">TODO</Popover.Content>
		</Popover.Root>
	</div>
	<div class="bg-white">
		{#if aggregationLevel === 'none'}
			<TreatmentTimeline
				events={radiationTreatment.events}
				width={visWidth}
				{startDate}
				{endDate}
			/>
		{:else}
			<TreatmentTimeline
				events={radiationTreatment.events}
				width={visWidth}
				{startDate}
				{endDate}
			/>
		{/if}
	</div>
</div>

<style>
	.table-container {
		grid-template-columns:
			24rem
			minmax(0, 1fr);
	}
</style>
