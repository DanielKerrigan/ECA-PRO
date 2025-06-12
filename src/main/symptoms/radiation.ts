import * as d3 from 'd3';
import { TreatmentEvent, TreatmentEventsByUser } from '../../shared/api.js';
import { parseDate } from '../utils.js';

export function getRadiationTreatments(contents: string): TreatmentEventsByUser {
	const rows = parseRows(contents);
	return d3.group(rows, (d) => d.userID);
}

function parseRows(contents: string): TreatmentEvent[] {
	return d3
		.csvParse(contents)
		.filter((d) => d['Event Name'] === 'Treatment Data')
		.map((d) => {
			const event: TreatmentEvent = {
				userID: +d['ECA ID'],
				treatment: 'Radiation',
				detail: d['Please enter the participants cancer type'],
				// TODO: make sure date parsed correctly
				date: parseDate(d['Date of radiation appointment'])!,
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
