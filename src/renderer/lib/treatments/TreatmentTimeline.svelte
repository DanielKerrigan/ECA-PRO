<script lang="ts">
	import type { RadiationEvent } from '../../../shared/api';
	import { scaleTime } from 'd3-scale';
	import type { ScaleTime } from 'd3-scale';
	import { scaleCanvas } from '$lib/vis-utils';
	import { axis } from '$lib/components/vis/axis/axis';
	import { timeDay } from 'd3-time';

	let {
		events,
		startDate,
		endDate,
		width,
		height = 32,
		marginLeft = 24,
		marginTop = 2,
		marginRight = 24,
		marginBottom = 24
	}: {
		events: RadiationEvent[];
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
		events.filter((event) => event.date >= startDate && event.date <= endDatePlusOne)
	);

	function getBarWidth(x: ScaleTime<number, number>, padding: number): number {
		const start = x.domain()[0];
		const startPlusOne = timeDay.offset(start, 1);
		const dayWidth = x(startPlusOne) - x(start) - 2 * padding;
		return dayWidth;
	}

	const barWidth = $derived(getBarWidth(x, padding));

	function draw(
		ctx: CanvasRenderingContext2D,
		events: RadiationEvent[],
		x: ScaleTime<number, number>,
		barWidth: number,
		padding: number,
		width: number,
		height: number
	) {
		ctx.save();

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		const barHeight = height - marginBottom - marginTop;

		ctx.fillStyle = 'black';

		for (const event of events) {
			const barX = x(event.date) + padding;

			ctx.fillRect(barX, marginTop, barWidth, barHeight);
		}

		axis(ctx, 'bottom', x, {
			translateY: height - marginBottom,
			showTickMarks: true
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
			draw(ctx, filteredEvents, x, barWidth, padding, width, height);
		}
	});
</script>

<div class="relative h-full w-full" style:width="{width}px" style:height="{height}px">
	<canvas bind:this={canvas} class="absolute"></canvas>
	<svg style:width style:height class="absolute"></svg>
</div>
