import * as d3 from 'd3';
import { TreatmentEvent } from '../../shared/api.js';

export function getRadiationTreatments(contents: string): TreatmentEvent[] {
	const rows = parseRows(contents);
	return rows;
}

function parseRows(contents: string): TreatmentEvent[] {
	const parseDate = d3.timeParse('%-m/%-d/%Y');

	const category = 'Radiation';

	return d3
		.csvParse(contents)
		.filter((d) => d['Event Name'] === 'Treatment Data')
		.map((d) => {
			const detail = `${d['Total radiation dose planned']} Gy in ${d['Total number of radiation fractions planned']} fx to ${d['Treatment site']}`;

			const event: TreatmentEvent = {
				kind: 'single',
				userID: +d['ECA ID'],
				category,
				detail,
				// TODO: make sure date parsed correctly
				date: parseDate(d['Date of radiation appointment'])!,
				stopDate: null,
				complete: d['Did the patient go to their radiation appointment?'] === 'Yes',
				extras: {
					'Total radiation dose received on this date':
						d['Total radiation dose received on this date'],
					'Total number of radiation fractions received on this date':
						d['Total number of radiation fractions received on this date']
				}
			};

			return event;
		});
}
