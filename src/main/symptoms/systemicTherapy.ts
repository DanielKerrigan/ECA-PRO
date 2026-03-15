import * as d3 from 'd3';
import { z } from 'zod';
import { FileResults, SingleTreatmentEvent } from '../../shared/api.js';
import { exampleDate, getFileData, zodDate, zodInteger, zodNonEmptyString } from '../utils.js';

export function getSystemicTherapySchema(
	parsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
): z.ZodType<SingleTreatmentEvent> {
	const Schema = z
		.object({
			'ECA ID': zodInteger('ECA ID'),
			'Event Name': z.string().trim(),
			'Treatment site': zodNonEmptyString('Treatment site'),
			'Name of [st_type]': zodNonEmptyString('Name of [st_type]'),
			'Treatment date': zodDate('Treatment date', parsers, exampleDateStrings),
			'The amount of [st_type] that the patient actually received': z.string().trim()
		})
		.transform((d): SingleTreatmentEvent => {
			const detail = `${d['Name of [st_type]']} - ${d['Treatment site']}`;

			const amtRecieved = d['The amount of [st_type] that the patient actually received'];
			const missed = amtRecieved === '';

			const extras = missed
				? []
				: [{ label: 'The amount that the patient actually received', value: amtRecieved }];

			return {
				kind: 'single',
				userId: d['ECA ID'],
				category: 'Systemic therapy',
				detail,
				date: d['Treatment date'],
				stopDate: null,
				missed,
				extras
			};
		});

	return Schema;
}

export function getSystemicTherapyTreatments(contents: string): FileResults<SingleTreatmentEvent> {
	const specifiers = ['%Y-%m-%d'];
	const parsers = specifiers.map((specifier) => d3.timeParse(specifier));
	const exampleDateStrings = specifiers.map((specifier) => d3.timeFormat(specifier)(exampleDate));

	const Schema = getSystemicTherapySchema(parsers, exampleDateStrings);

	return getFileData(contents, Schema);
}
