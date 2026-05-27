import * as d3 from 'd3';
import { z } from 'zod';
import { FileResults, SingleTreatmentEvent } from '../../shared/api.js';
import {
	exampleDate,
	getFileData,
	zodDate,
	zodInteger,
	zodNonEmptyString,
	zodRequiredString
} from '../utils.js';

export function getRadiationSchema(
	parsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
): z.ZodType<SingleTreatmentEvent> {
	const Schema = z
		.object({
			'ECA ID': zodInteger(),
			'Treatment site': zodNonEmptyString(),
			'Date of radiation appointment': zodDate(parsers, exampleDateStrings),
			'Total radiation dose received on this date': zodRequiredString(),
			'Total number of radiation fractions received on this date': zodRequiredString(),
			'Total radiation dose planned': zodNonEmptyString(),
			'Total number of radiation fractions planned': zodNonEmptyString()
		})
		.transform((d): SingleTreatmentEvent => {
			const detail = `${d['Total radiation dose planned']} Gy in ${d['Total number of radiation fractions planned']} fx to ${d['Treatment site']}`;

			const doseReceived = d['Total radiation dose received on this date'];
			const fxReceived = d['Total number of radiation fractions received on this date'];

			const missed = doseReceived === '' && fxReceived === '';

			const extras = missed
				? []
				: [
						{ label: 'Total radiation dose received on this date', value: doseReceived },
						{
							label: 'Total number of radiation fractions received on this date',
							value: fxReceived
						}
					];

			return {
				kind: 'single',
				userId: d['ECA ID'],
				category: 'Radiation',
				detail,
				date: d['Date of radiation appointment'],
				stopDate: null,
				missed,
				extras
			};
		});

	return Schema;
}

export function getRadiationTreatments(contents: string): FileResults<SingleTreatmentEvent> {
	const specifiers = ['%-m/%-d/%Y'];
	const parsers = specifiers.map((specifier) => d3.timeParse(specifier));
	const exampleDateStrings = specifiers.map((specifier) => d3.timeFormat(specifier)(exampleDate));

	const Schema = getRadiationSchema(parsers, exampleDateStrings);

	return getFileData(contents, Schema);
}
