<script lang="ts">
	import type { TreatmentEvent } from '../../../shared/api';
	import { scaleTime } from 'd3-scale';
	import type { ScaleTime } from 'd3-scale';
	import { scaleCanvas } from '$lib/vis-utils';
	import { axis } from '$lib/components/vis/axis/axis';
	import { timeDay } from 'd3-time';
	import { max, min } from '../../../shared/utils';

	let {
		events,
		startDate,
		endDate,
		width,
		height = 32,
		marginLeft = 24,
		marginTop = 2,
		marginRight = 24,
		marginBottom = 18
	}: {
		events: TreatmentEvent[];
		startDate: Date;
		endDate: Date;
		width: number;
		height?: number;
		marginLeft?: number;
		marginTop?: number;
		marginRight?: number;
		marginBottom?: number;
	} = $props();

	const endDatePlusOne = $derived(timeDay.offset(endDate, 1));

	const padding = 1;

	let canvas: HTMLCanvasElement | null = $state(null);
	let ctx: CanvasRenderingContext2D | null = $derived(
		canvas
			? (canvas as HTMLCanvasElement).getContext('2d', {
					alpha: false
				})
			: null
	);

	const x = $derived(
		scaleTime()
			.domain([startDate, endDatePlusOne])
			.range([marginLeft, width - marginRight])
	);

	const filteredEvents = $derived(
		events.filter((event) => {
			if (event.kind === 'single') {
				return event.date >= startDate && event.date <= endDatePlusOne;
			} else {
				return (
					event.date <= endDatePlusOne && (event.stopDate === null || event.stopDate >= startDate)
				);
			}
		})
	);

	function getBarWidthForDay(x: ScaleTime<number, number>, padding: number): number {
		const start = x.domain()[0];
		const startPlusOne = timeDay.offset(start, 1);
		const dayWidth = x(startPlusOne) - x(start) - 2 * padding;
		return dayWidth;
	}

	const barWidth = $derived(getBarWidthForDay(x, padding));

	function draw(
		ctx: CanvasRenderingContext2D,
		events: TreatmentEvent[],
		x: ScaleTime<number, number>,
		barWidthForDay: number,
		padding: number,
		width: number,
		height: number,
		startDate: Date,
		endDatePlusOne: Date
	) {
		ctx.save();

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		const barHeight = height - marginBottom - marginTop;

		ctx.strokeStyle = 'steelblue';
		ctx.fillStyle = 'steelblue';

		for (const event of events) {
			// max here because for a range event, event.date could be earlier than startDate
			const barX = x(max(event.date, startDate)) + padding;
			const barWidth =
				event.kind === 'single'
					? barWidthForDay
					: x(min(event.stopDate ?? endDatePlusOne, endDatePlusOne)) - barX;

			ctx.strokeRect(barX, marginTop, barWidth, barHeight);
			ctx.fillRect(barX, marginTop, barWidth, barHeight);
		}

		axis(ctx, 'bottom', x, {
			translateY: height - marginBottom,
			showTickMarks: true,
			tickLineSize: 4,
			tickPadding: 2
		});

		ctx.restore();
	}

	$effect(() => {
		if (canvas && ctx) {
			scaleCanvas(canvas, ctx, width, height);
		}
	});

	$effect(() => {
		if (ctx) {
			draw(ctx, filteredEvents, x, barWidth, padding, width, height, startDate, endDatePlusOne);
		}
	});
</script>

<div class="relative h-full w-full" style:width="{width}px" style:height="{height}px">
	<canvas bind:this={canvas} class="absolute"></canvas>
	<svg style:width style:height class="absolute"></svg>
</div>
