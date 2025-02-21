<script lang="ts">
	import type { PROResponse, PROItem } from '../../../shared/api';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import type { ScaleTime, ScaleLinear } from 'd3-scale';
	import { area as d3area, line as d3line, curveStep } from 'd3-shape';
	import type { Area, Line } from 'd3-shape';
	import { scaleCanvas } from '$lib/vis-utils';
	import { axis } from '$lib/components/vis/axis/axis';
	import { timeDay, timeWeek, timeMonth } from 'd3-time';
	import { getAggregatedSummaryData } from './aggregation';
	import type { AggregatedPROResponses } from './aggregation';

	let {
		responses,
		item,
		aggregationLevel,
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
		aggregationLevel: string;
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

	const line = $derived(
		d3line<AggregatedPROResponses>()
			.defined((d) => d.median !== undefined)
			.x((d) => x(d.start))
			.y((d) => y(d.median ?? 0))
			.curve(curveStep)
	);

	const area = $derived(
		d3area<AggregatedPROResponses>()
			.defined((d) => d.min !== undefined && d.median !== undefined)
			.x((d) => x(d.start))
			.y0((d) => y(d.min ?? 0))
			.y1((d) => y(d.max ?? 0))
			.curve(curveStep)
	);

	const timeInterval = $derived(aggregationLevel === 'weekly' ? timeWeek : timeMonth);
	const aggregatedData: AggregatedPROResponses[] = $derived(
		getAggregatedSummaryData(filteredResponses, timeInterval, startDate, endDate)
	);

	function draw(
		ctx: CanvasRenderingContext2D,
		aggregatedData: AggregatedPROResponses[],
		x: ScaleTime<number, number>,
		y: ScaleLinear<number, number>,
		line: Line<AggregatedPROResponses>,
		area: Area<AggregatedPROResponses>,
		width: number,
		height: number
	) {
		ctx.save();

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		area.context(ctx);
		ctx.fillStyle = '#a6cee3';
		ctx.beginPath();
		area(aggregatedData);
		ctx.fill();

		line.context(ctx);
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.strokeStyle = '#1f78b4';
		line(aggregatedData);
		ctx.stroke();

		for (const bin of aggregatedData) {
			if (bin.median !== undefined) {
				const cx = x(bin.start);
				const cy = y(bin.median);

				ctx.beginPath();
				ctx.fillStyle = 'black';
				ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
				ctx.fill();
			}
		}

		axis(ctx, 'bottom', x, {
			translateY: height - marginBottom,
			showTickMarks: true,
			showDomain: true
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
			draw(ctx, aggregatedData, x, y, line, area, width, height);
		}
	});
</script>

<div class="relative h-full w-full" style:width="{width}px" style:height="{height}px">
	<canvas bind:this={canvas} class="absolute"></canvas>
	<svg style:width style:height class="absolute"></svg>
</div>
