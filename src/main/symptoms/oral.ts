import * as d3 from 'd3';
import { z } from 'zod';
import { FileResults, RangeTreatmentEvent } from '../../shared/api.js';
import {
	exampleDate,
	getFileData,
	zodDate,
	zodInteger,
	zodNonEmptyString,
	zodOptionalDate
} from '../utils.js';

export function getOralSchema(
	parsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
): z.ZodType<RangeTreatmentEvent> {
	const Schema = z
		.object({
			'ECA ID': zodInteger('ECA ID'),
			'Event Name': z.string().trim(),
			'Name of oral therapy medication': zodNonEmptyString('Name of oral therapy medication'),
			'Start date of oral therapy medication': zodDate(
				'Start date of oral therapy medication',
				parsers,
				exampleDateStrings
			),
			'Date the oral therapy was discontinued': zodOptionalDate(
				'Date the oral therapy was discontinued',
				parsers,
				exampleDateStrings
			)
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
