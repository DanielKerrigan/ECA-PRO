import { timeWeek, timeMonth } from 'd3-time';
import type { ProResponse, RangeTreatmentEvent, TreatmentEvent } from '../../shared/api';
import { min, max } from '../../shared/utils';
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

export type AggregatedProResponses = {
	start: Date;
	end: Date;
	counts: InternMap<number, number>;
};

export function getAggregatedProResponses(
	responses: ProResponse[],
	aggregationLevel: Exclude<AggregationLevel, 'none'>,
	startDate: Date,
	endDate: Date
): AggregatedProResponses[] {
	const filteredResponses = responses.filter(
		(response) => response.dateTime >= startDate && response.dateTime <= endDate
	);

	const interval = aggregationLevel === 'weekly' ? timeWeek : timeMonth;

	return rollups(
		filteredResponses,
		(g) => {
			const counts = rollup(
				g,
				(g) => g.length,
				(d) => d.normalizedResponseValue
			);

			const floored = interval.floor(g[0].dateTime);
			const start = max(floored, startDate);
			const end = min(interval.offset(floored, 1), endDate);

			return { counts, start, end };
		},
		(d) => interval.count(startDate, d.dateTime)
	)
		.map((d) => d[1])
		.sort((a, b) => ascending(a.start, b.end));
}

export function getAggregatedTreatmentEvents(
	events: TreatmentEvent[],
	aggregationLevel: AggregationLevel,
	startDate: Date,
	endDate: Date
): TreatmentEvent[] {
	const filteredEvents = events.filter((event) => {
		if (event.kind === 'single') {
			return event.date >= startDate && event.date <= endDate;
		} else {
			return event.date <= endDate && (event.stopDate === null || event.stopDate >= startDate);
		}
	});

	if (aggregationLevel === 'none' || events[0].kind === 'range') {
		return filteredEvents;
	}

	const interval = aggregationLevel === 'weekly' ? timeWeek : timeMonth;

	return rollups(
		filteredEvents,
		(g) => {
			const made = g.filter((d) => !d.missed);
			if (made.length > 0) {
				const floored = interval.floor(made[0].date);
				const start = max(floored, startDate);
				const end = min(interval.offset(floored, 1), endDate);

				const event: RangeTreatmentEvent = {
					...made[0],
					kind: 'range',
					date: start,
					stopDate: end,
					missed: false,
					extras: []
				};
				return event;
			} else {
				return null;
			}
		},
		(d) => interval.count(startDate, d.date)
	)
		.flatMap((d) => d[1])
		.filter((d) => d !== null);
}
