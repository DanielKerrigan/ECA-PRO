<script lang="ts">
	import * as Popover from '$lib/components/ui/popover/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { cn } from '../utils';
	import { buttonVariants } from '$lib/components/ui/button/index.js';
	import * as RadioGroup from '$lib/components/ui/radio-group/index.js';
	import type { PROConstructOrderKey, PROUserConstructOrders } from '../../../shared/api';
	import { timeFormat } from 'd3-time-format';
	import ArrowDownUp from 'lucide-svelte/icons/arrow-down-up';

	let {
		sortingKey,
		proUserConstructOrders,
		onChangeSortingKey
	}: {
		sortingKey: PROConstructOrderKey;
		proUserConstructOrders: PROUserConstructOrders;
		onChangeSortingKey: (ranking: PROConstructOrderKey) => void;
	} = $props();

	const fmt = timeFormat('%x');

	const startDateStr = fmt(proUserConstructOrders.severity.startDate);
	const endDateStr = fmt(proUserConstructOrders.severity.endDate);

	type Options = { value: PROConstructOrderKey; display: string }[];
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
		<ArrowDownUp class="size-6" />
	</Popover.Trigger>
	<Popover.Content class="w-fit" align="start">
		<div class="flex flex-col gap-2">
			<div class="text-lg font-bold">Symptom Sorting</div>
			<RadioGroup.Root
				value={sortingKey}
				onValueChange={(v) => onChangeSortingKey(v as PROConstructOrderKey)}
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
