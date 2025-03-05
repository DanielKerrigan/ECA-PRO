<script lang="ts">
	import type { PROResponse, PROItem } from '../../../shared/api';
	import { max } from 'd3-array';
	import { scaleTime, scaleLinear } from 'd3-scale';
	import type { ScaleTime, ScaleLinear } from 'd3-scale';
	import { stack as d3stack, stackOffsetExpand, stackOffsetNone } from 'd3-shape';
	import type { Series } from 'd3-shape';
	import { getPROColor, scaleCanvas } from '$lib/vis-utils';
	import { axis } from '$lib/components/vis/axis/axis';
	import { timeDay, timeWeek, timeMonth } from 'd3-time';
	import { getAggregatedSummaryData } from './aggregation';
	import type { AggregatedPROResponses } from './aggregation';
	import { format } from 'd3-format';

	let {
		responses,
		item,
		aggregationLevel,
		startDate,
		endDate,
		normalizeBars,
		width,
		height = 128,
		marginLeft = 40,
		marginTop = 24,
		marginRight = 24,
		marginBottom = 24
	}: {
		responses: PROResponse[];
		item: PROItem;
		aggregationLevel: string;
		startDate: Date;
		endDate: Date;
		normalizeBars: boolean;
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

	const filteredResponses = $derived(
		responses.filter(
			(response) => response.dateTime >= startDate && response.dateTime <= endDatePlusOne
		)
	);

	const timeInterval = $derived(aggregationLevel === 'weekly' ? timeWeek : timeMonth);
	const aggregatedData: AggregatedPROResponses[] = $derived(
		getAggregatedSummaryData(filteredResponses, timeInterval, startDate, endDatePlusOne)
	);

	const keys = $derived([
		item.responseItemValues[item.responseItemValues.length - 1],
		...item.responseItemValues.slice(0, -1)
	]);

	const stack = $derived(
		d3stack<any, AggregatedPROResponses, number>()
			.keys(keys)
			.value((d, key) => d.counts.get(key) ?? 0)
			.offset(normalizeBars ? stackOffsetExpand : stackOffsetNone)
	);

	const series = $derived(stack(aggregatedData));

	const x = $derived(
		scaleTime()
			.domain([startDate, endDatePlusOne])
			.range([marginLeft, width - marginRight])
	);

	const y = $derived(
		scaleLinear()
			.domain([0, max(series, (layer) => max(layer, (point) => point[1]) ?? 0) ?? 0])
			.range([height - marginBottom, marginTop])
	);

	function draw(
		ctx: CanvasRenderingContext2D,
		series: Series<AggregatedPROResponses, number>[],
		x: ScaleTime<number, number>,
		y: ScaleLinear<number, number>,
		normalizeBars: boolean,
		width: number,
		height: number
	) {
		ctx.save();

		ctx.fillStyle = 'white';
		ctx.fillRect(0, 0, width, height);

		for (const layer of series) {
			ctx.fillStyle = getPROColor(layer.key, item.responseItemValues);
			for (const point of layer) {
				const left = x(point.data.start) + 1;
				const right = x(point.data.end) - 1;
				const bottom = y(point[0]);
				const top = y(point[1]);
				ctx.fillRect(left, top, right - left, bottom - top);
			}
		}

		axis(ctx, 'bottom', x, {
			translateY: height - marginBottom,
			showTickMarks: true,
			showDomain: true
		});

		axis(ctx, 'left', y, {
			translateX: marginLeft,
			showTickMarks: true,
			showDomain: false,
			tickValues: normalizeBars ? y.ticks(5) : y.ticks(5).filter(Number.isInteger),
			tickFormat: normalizeBars ? format('.0%') : format('d'),
			title: normalizeBars ? 'Percentage' : 'Count',
			titleAnchor: 'top',
			marginLeft: marginLeft - 5,
			marginTop: marginTop - 5,
			marginRight,
			marginBottom
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
			draw(ctx, series, x, y, normalizeBars, width, height);
		}
	});
</script>

<div class="relative h-full w-full" style:width="{width}px" style:height="{height}px">
	<canvas bind:this={canvas} class="absolute"></canvas>
	<svg style:width style:height class="absolute"></svg>
</div>
