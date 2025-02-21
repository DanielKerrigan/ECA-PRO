import type { CountableTimeInterval } from 'd3-time';
import type { PROResponse } from '../../../shared/api';
import { min, max } from '../utils';
import {
	rollup,
	rollups,
	median as d3median,
	max as d3max,
	min as d3min,
	ascending
} from 'd3-array';
import type { InternMap } from 'd3-array';

export type AggregationLevel = 'none' | 'weekly' | 'monthly';

export const aggregationLevels: AggregationLevel[] = ['none', 'weekly', 'monthly'];

export type AggregatedPROResponses = {
	median: number | undefined;
	min: number | undefined;
	max: number | undefined;
	start: Date;
	end: Date;
	counts: InternMap<number, number>;
};

export function getAggregatedSummaryData(
	responses: PROResponse[],
	interval: CountableTimeInterval,
	startDate: Date,
	endDate: Date
): AggregatedPROResponses[] {
	return rollups(
		responses,
		(g) => {
			const answered = g.filter((d) => d.responseText !== 'Prefer not to say');
			const medianValue = d3median(answered, (d) => d.responseValue);
			const minValue = d3min(answered, (d) => d.responseValue);
			const maxValue = d3max(answered, (d) => d.responseValue);

			const counts = rollup(
				g,
				(g) => g.length,
				(d) => d.responseValue
			);

			const floored = interval.floor(g[0].dateTime);
			const start = max(floored, startDate);
			const end = min(interval.offset(floored, 1), endDate);

			return { median: medianValue, min: minValue, max: maxValue, counts, start, end };
		},
		(d) => interval.count(startDate, d.dateTime)
	)
		.map((d) => d[1])
		.sort((a, b) => ascending(a.start, b.end));
}
