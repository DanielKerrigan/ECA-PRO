<!-- Axis component based on d3-axis -->

<script lang="ts" generics="D extends Domain">
	import type { AxisOrientation, AxisScale, AxisTitleAnchor, Domain } from './axis';
	import { getTitleLocation } from './axis';
	import Label from './Label.svelte';

	let {
		orientation,
		scale,
		translateX = 0,
		translateY = 0,
		marginLeft = 0,
		marginTop = 0,
		marginRight = 0,
		marginBottom = 0,
		tickLineSize = 6,
		tickLabelFontSize = 10,
		tickPadding = 3,
		tickFormat,
		numTicks,
		tickValues,
		showTickMarks = true,
		showTickLabels = true,
		maxTickLabelSpace,
		tickLineColor = 'black',
		tickLabelColor = 'black',
		title = '',
		titleFontSize = 12,
		titleAnchor = 'center',
		titleColor = 'black'
	}: {
		orientation: AxisOrientation;
		scale: AxisScale<D>;
		translateX?: number;
		translateY?: number;
		marginLeft?: number;
		marginTop?: number;
		marginRight?: number;
		marginBottom?: number;
		tickLineSize?: number;
		tickLabelFontSize?: number;
		tickPadding?: number;
		tickFormat?: (value: D) => string;
		numTicks?: number;
		tickValues?: D[];
		showTickMarks?: boolean;
		showTickLabels?: boolean;
		maxTickLabelSpace?: number;
		tickLineColor?: string;
		tickLabelColor?: string;
		title?: string;
		titleFontSize?: number;
		titleAnchor?: AxisTitleAnchor;
		titleColor?: string;
	} = $props();

	const k = $derived(orientation === 'top' || orientation === 'left' ? -1 : 1);
	const tickSpacing = $derived(Math.max(tickLineSize, 0) + tickPadding);
	const offset = $derived(scale.bandwidth ? scale.bandwidth() / 2 : 0);

	const values = $derived(tickValues ?? (scale.ticks ? scale.ticks(numTicks) : scale.domain()));

	const format = $derived(
		tickFormat ??
			(scale.tickFormat ? scale.tickFormat(numTicks) : (d: Domain) => String(d).toString())
	);

	const titleLocation = $derived(
		getTitleLocation(
			orientation,
			titleAnchor,
			scale,
			marginLeft,
			marginTop,
			marginRight,
			marginBottom,
			titleFontSize
		)
	);
</script>

<g transform="translate({translateX},{translateY})">
	<g>
		{#each values as d}
			{#if orientation === 'left' || orientation == 'right'}
				{@const y = (scale(d) ?? 0) + offset}
				<g transform="translate(0,{y})">
					{#if showTickMarks}
						<line x1={tickLineSize * k} y1={0} x2={0} y2={0} stroke={tickLineColor} />
					{/if}
					{#if showTickLabels}
						{#if maxTickLabelSpace}
							<Label
								label={format(d)}
								width={maxTickLabelSpace}
								x={tickSpacing * k}
								y={0}
								dominantBaseline={'middle'}
								textAnchor={orientation === 'left' ? 'end' : 'start'}
								fontSize={tickLabelFontSize}
								fontColor={tickLabelColor}
							/>
						{:else}
							<text
								x={tickSpacing * k}
								y={0}
								dominant-baseline={'middle'}
								text-anchor={orientation === 'left' ? 'end' : 'start'}
								font-size={tickLabelFontSize}
								fill={tickLabelColor}>{format(d)}</text
							>
						{/if}
					{/if}
				</g>
			{:else}
				{@const x = (scale(d) ?? 0) + offset}
				<g transform="translate({x},0)">
					{#if showTickMarks}
						<line x1={0} y1={tickLineSize * k} x2={0} y2={0} stroke={tickLineColor} />
					{/if}
					{#if showTickLabels}
						{#if maxTickLabelSpace}
							<Label
								label={format(d)}
								width={maxTickLabelSpace}
								x={0}
								y={tickSpacing * k}
								dominantBaseline={orientation === 'top' ? 'text-top' : 'hanging'}
								textAnchor={'middle'}
								fontSize={tickLabelFontSize}
								fontColor={tickLabelColor}
							/>
						{:else}
							<text
								x={0}
								y={tickSpacing * k}
								dominant-baseline={orientation === 'top' ? 'text-top' : 'hanging'}
								text-anchor={'middle'}
								font-size={tickLabelFontSize}
								fill={tickLabelColor}>{format(d)}</text
							>
						{/if}
					{/if}
				</g>
			{/if}
		{/each}
	</g>

	{#if title}
		<text
			fill={titleColor}
			font-size={titleFontSize}
			text-anchor={titleLocation.textAnchor}
			y={titleLocation.y}
			x={titleLocation.x}>{title}</text
		>
	{/if}
</g>
