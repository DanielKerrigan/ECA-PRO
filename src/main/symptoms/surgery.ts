import { FileResults, SingleTreatmentEvent } from '../../shared/api.js';
import {
	exampleDate,
	getFileData,
	zodDate,
	zodInteger,
	zodNonEmptyString,
	zodRequiredString
} from '../utils.js';

import * as d3 from 'd3';
import { z } from 'zod';

export function getSurgerySchema(
	parsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
): z.ZodType<SingleTreatmentEvent> {
	const Schema = z
		.object({
			'ECA ID': zodInteger(),
			'Event Name': zodRequiredString(),
			'Treatment site': zodNonEmptyString(),
			'Date of surgery': zodDate(parsers, exampleDateStrings),
			'Name of surgery/surgery site': zodNonEmptyString()
		})
		.transform((d): SingleTreatmentEvent => {
			const detail = d['Name of surgery/surgery site'];

			return {
				kind: 'single',
				userId: d['ECA ID'],
				category: 'Surgery',
				detail,
				date: d['Date of surgery'],
				stopDate: null,
				missed: false,
				extras: []
			};
		});

	return Schema;
}

export function getSurgeries(contents: string): FileResults<SingleTreatmentEvent> {
	const specifiers = ['%Y-%m-%d'];
	const parsers = specifiers.map((specifier) => d3.timeParse(specifier));
	const exampleDateStrings = specifiers.map((specifier) => d3.timeFormat(specifier)(exampleDate));

	const Schema = getSurgerySchema(parsers, exampleDateStrings);

	return getFileData(contents, Schema);
}
