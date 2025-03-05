import { fitString } from '$lib/vis-utils';

export type AxisOrientation = 'top' | 'right' | 'bottom' | 'left';
export type AxisTitleAnchor = 'top' | 'right' | 'bottom' | 'left' | 'center';

export type Domain = number | string | Date;

export type AxisScale<D extends Domain> = {
	(x: D): number | undefined;
	domain(): D[];
	range(): number[];
	bandwidth?(): number;
	ticks?(count?: number): D[];
	tickFormat?(count?: number, specifier?: string): (d: D) => string;
};

export function getTitleLocation<D extends Domain>(
	orientation: AxisOrientation,
	titleAnchor: AxisTitleAnchor,
	scale: AxisScale<D>,
	marginLeft: number,
	marginTop: number,
	marginRight: number,
	marginBottom: number,
	fontSize: number
): { textAnchor: string; x: number; y: number } {
	const minRange = Math.min(...scale.range());
	const maxRange = Math.max(...scale.range());
	const midRange = (minRange + maxRange) / 2;

	const isLeft = orientation === 'left';
	const isRight = orientation === 'right';
	const isTop = orientation === 'top';
	const isBottom = orientation === 'bottom';

	if (isLeft || isRight) {
		const x = isLeft ? -marginLeft : marginRight;
		if (titleAnchor === 'top') {
			const yPos = minRange - marginTop;
			const dy = 0.71 * fontSize;
			return { textAnchor: isLeft ? 'start' : 'end', x, y: yPos + dy };
		} else if (titleAnchor === 'bottom') {
			return {
				textAnchor: isLeft ? 'start' : 'end',
				x,
				y: maxRange + marginBottom
			};
		} else {
			const yPos = midRange;
			const dy = 0.32 * fontSize;
			return { textAnchor: isLeft ? 'end' : 'start', x, y: yPos + dy };
		}
	} else {
		const y = isTop ? -marginTop + fontSize / 2 : marginBottom - fontSize / 2;
		const dy = isTop ? fontSize * 0.71 : 0;
		if (titleAnchor === 'left') {
			return {
				textAnchor: 'start',
				x: minRange - marginLeft,
				y: y + dy
			};
		} else if (titleAnchor === 'right') {
			return { textAnchor: 'end', x: maxRange + marginRight, y: y + dy };
		} else {
			return {
				textAnchor: 'middle',
				x: midRange,
				y: y + dy
			};
		}
	}
}

export function axis<D extends Domain>(
	ctx: CanvasRenderingContext2D,
	orientation: AxisOrientation,
	scale: AxisScale<D>,
	{
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
		showDomain = false,
		domainColor = 'black',
		title = '',
		titleFontSize = 12,
		titleAnchor = 'center',
		titleColor = 'black'
	}: {
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
		showDomain?: boolean;
		domainColor?: string;
		title?: string;
		titleFontSize?: number;
		titleAnchor?: AxisTitleAnchor;
		titleColor?: string;
	} = {}
): void {
	const k = orientation === 'top' || orientation === 'left' ? -1 : 1;
	const tickSpacing = Math.max(tickLineSize, 0) + tickPadding;
	const offset = scale.bandwidth ? scale.bandwidth() / 2 : 0;

	const titleLocation = getTitleLocation(
		orientation,
		titleAnchor,
		scale,
		marginLeft,
		marginTop,
		marginRight,
		marginBottom,
		titleFontSize
	);

	const values = tickValues ?? (scale.ticks ? scale.ticks(numTicks) : scale.domain());

	const format =
		tickFormat ?? (scale.tickFormat ? scale.tickFormat(numTicks) : (d: D) => String(d).toString());

	ctx.save();

	ctx.translate(translateX, translateY);

	ctx.font = `${tickLabelFontSize}px sans-serif`;
	ctx.globalAlpha = 1;

	ctx.strokeStyle = domainColor;
	ctx.lineWidth = 1;

	if (showDomain) {
		ctx.beginPath();
		ctx.moveTo(scale.range()[0], 0);
		ctx.lineTo(scale.range()[1], 0);
		ctx.stroke();
	}

	ctx.fillStyle = tickLabelColor;
	ctx.strokeStyle = tickLineColor;

	values.forEach((d) => {
		if (orientation === 'left' || orientation === 'right') {
			const y = (scale(d) ?? 0) + offset;

			if (showTickMarks) {
				ctx.beginPath();
				ctx.moveTo(tickLineSize * k, y);
				ctx.lineTo(0, y);
				ctx.stroke();
			}

			if (showTickLabels) {
				ctx.textBaseline = 'middle';
				ctx.textAlign = orientation === 'left' ? 'end' : 'start';
				const tickLabel = maxTickLabelSpace
					? fitString(ctx, format(d), maxTickLabelSpace)
					: format(d);
				ctx.fillText(tickLabel, tickSpacing * k, y);
			}
		} else {
			const x = (scale(d) ?? 0) + offset;

			if (showTickMarks) {
				ctx.beginPath();
				ctx.moveTo(x, tickLineSize * k);
				ctx.lineTo(x, 0);
				ctx.stroke();
			}

			if (showTickLabels) {
				ctx.textBaseline = orientation === 'top' ? 'bottom' : 'top';
				ctx.textAlign = 'center';
				const tickLabel = maxTickLabelSpace
					? fitString(ctx, format(d), maxTickLabelSpace)
					: format(d);
				ctx.fillText(tickLabel, x, tickSpacing * k);
			}
		}
	});

	if (title) {
		ctx.textAlign = 'start';
		ctx.textBaseline = 'alphabetic';
		ctx.font = `${titleFontSize}px sans-serif`;
		ctx.fillStyle = titleColor;
		ctx.fillText(title, titleLocation.x, titleLocation.y);
	}

	ctx.restore();
}
