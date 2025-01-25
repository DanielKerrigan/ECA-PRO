<script lang="ts">
	import type { PROResponse, PROItem } from '../../shared/api';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import type { ScaleTime, ScaleLinear } from 'd3-scale';
	import { interpolateOrRd } from 'd3-scale-chromatic';
	import { scaleCanvas } from './vis-utils';
	import { axis } from './axis';
	import { timeDay } from 'd3-time';

	let {
		responses,
		item,
		startDate,
		endDate,
		width,
		height = 128,
		marginLeft = 24,
		marginTop = 8,
		marginRight = 24,
		marginBottom = 24
	}: {
		responses: PROResponse[];
		item: PROItem;
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

	let canvas: HTMLCanvasElement | null = $state(null);
	let ctx: CanvasRenderingContext2D | null = $derived(
		canvas
			? (canvas as HTMLCanvasElement)?.getContext('2d', {
					alpha: false
				})
			: null
	);

	const barWidth = 3;

	const x = $derived(
		scaleTime()
			.domain([startDate, endDatePlusOne])
			.range([marginLeft, width - marginRight])
	);

	const y = $derived(
		scaleLinear()
			.domain([0, item.responseItemValues.length - 2])
			.range([height - marginBottom, marginTop])
	);

	const filteredResponses = $derived(
		responses.filter(
			(response) => response.dateTime >= startDate && response.dateTime <= endDatePlusOne
		)
	);

	function draw(
		ctx: CanvasRenderingContext2D,
		responses: PROResponse[],
		x: ScaleTime<number, number>,
		y: ScaleLinear<number, number>,
		barWidth: number,
		width: number,
		height: number
	) {
		ctx.save();

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		const baselineHeight = 6;

		ctx.fillStyle = '#f5f5f5';
		ctx.fillRect(x.range()[0], y.range()[0], x.range()[1] - x.range()[0], baselineHeight);

		for (const response of responses) {
			const barX = x(response.dateTime) - barWidth / 2;
			if (response.responseValue === 0) {
				ctx.fillStyle = '#07b63f';
				ctx.fillRect(barX, y.range()[0], barWidth, baselineHeight);
			} else if (
				response.responseValue === item.responseItemValues[item.responseItemValues.length - 1]
			) {
				ctx.fillStyle = '#737373';
				ctx.fillRect(barX, y.range()[0], barWidth, baselineHeight);
			} else {
				const percent = response.responseValue / (item.responseItemValues.length - 2);
				ctx.fillStyle = interpolateOrRd(percent);
				ctx.fillRect(
					barX,
					y(response.responseValue),
					barWidth,
					y.range()[0] - y(response.responseValue)
				);
			}
		}

		axis(ctx, 'bottom', x, {
			translateY: height - marginBottom,
			showTickMarks: false
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
			draw(ctx, filteredResponses, x, y, barWidth, width, height);
		}
	});
</script>

<div class="relative h-full w-full" style:width="{width}px" style:height="{height}px">
	<canvas bind:this={canvas} class="absolute"></canvas>
	<svg style:width style:height class="absolute"></svg>
</div>
