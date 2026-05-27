<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '../utils';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import type { ProConstructOrderMethod, ProUserConstructOrders } from '../../../shared/api';
	import { timeFormat } from 'd3-time-format';
	import ArrowDownUp from '@lucide/svelte/icons/arrow-down-up';

	let {
		orderMethod,
		proUserConstructOrders,
		onChangeOrderMethod
	}: {
		orderMethod: ProConstructOrderMethod;
		proUserConstructOrders: ProUserConstructOrders;
		onChangeOrderMethod: (method: ProConstructOrderMethod) => void;
	} = $props();

	const fmt = timeFormat('%x');

	const startDateStr = fmt(proUserConstructOrders.severity.startDate);
	const endDateStr = fmt(proUserConstructOrders.severity.endDate);

	type Options = { value: ProConstructOrderMethod; display: string }[];
	const options: Options = $derived([
		{ value: 'category', display: 'Category' },
		{
			value: 'severity',
			display: `Seriousness (${startDateStr} - ${endDateStr})`
		}
	]);
</script>

<Popover.Root>
	<Popover.Trigger class={cn([buttonVariants({ variant: 'ghost' }), 'size-6 p-0'])}>
		<ArrowDownUp class="size-4" />
	</Popover.Trigger>
	<Popover.Content class="w-fit" align="start">
		<div class="flex flex-col gap-2">
			<div class="text-lg font-bold">Symptom Sorting</div>
			<RadioGroup.Root
				value={orderMethod}
				onValueChange={(v) => onChangeOrderMethod(v as ProConstructOrderMethod)}
			>
				{#each options as { value, display }}
					<div class="flex items-center gap-2">
						<RadioGroup.Item {value} id="pro-ranking-{value}-radio" />
						<Label for="pro-ranking-{value}-radio" class="text-base font-normal">{display}</Label>
					</div>
				{/each}
			</RadioGroup.Root>
		</div>
	</Popover.Content>
</Popover.Root>
