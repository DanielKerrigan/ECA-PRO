import * as d3 from 'd3';
import { z } from 'zod';
import { FileResults, RangeTreatmentEvent } from '../../shared/api.js';
import {
	exampleDate,
	getFileData,
	zodDate,
	zodInteger,
	zodNonEmptyString,
	zodOptionalDate,
	zodRequiredString
} from '../utils.js';

export function getOralSchema(
	parsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
): z.ZodType<RangeTreatmentEvent> {
	const Schema = z
		.object({
			'ECA ID': zodInteger(),
			'Event Name': zodRequiredString(),
			'Name of oral therapy medication': zodNonEmptyString(),
			'Start date of oral therapy medication': zodDate(parsers, exampleDateStrings),
			'Date the oral therapy was discontinued': zodOptionalDate(parsers, exampleDateStrings)
		})
		.transform((d): RangeTreatmentEvent => {
			const detail = d['Name of oral therapy medication'];

			return {
				userId: d['ECA ID'],
				kind: 'range',
				category: 'Oral',
				detail,
				date: d['Start date of oral therapy medication'],
				stopDate: d['Date the oral therapy was discontinued'],
				missed: false,
				extras: []
			};
		});

	return Schema;
}

export function getOralTreatments(contents: string): FileResults<RangeTreatmentEvent> {
	const specifiers = ['%-m/%-d/%Y'];
	const parsers = specifiers.map((specifier) => d3.timeParse(specifier));
	const exampleDateStrings = specifiers.map((specifier) => d3.timeFormat(specifier)(exampleDate));

	const Schema = getOralSchema(parsers, exampleDateStrings);

	return getFileData(contents, Schema);
}
