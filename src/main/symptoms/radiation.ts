import * as d3 from 'd3';
import { SingleTreatmentEvent } from '../../shared/api.js';

export function getRadiationTreatments(contents: string): SingleTreatmentEvent[] {
	const rows = parseRows(contents);
	return rows;
}

function parseRows(contents: string): SingleTreatmentEvent[] {
	const parseDate = d3.timeParse('%-m/%-d/%Y');

	const category = 'Radiation';

	return d3.csvParse(contents).map((d) => {
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

		const event: SingleTreatmentEvent = {
			kind: 'single',
			userID: +d['ECA ID'],
			category,
			detail,
			// TODO: make sure date parsed correctly
			date: parseDate(d['Date of radiation appointment'])!,
			stopDate: null,
			missed,
			extras
		};

		return event;
	});
}
