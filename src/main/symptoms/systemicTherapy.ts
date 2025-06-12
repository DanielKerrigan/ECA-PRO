import * as d3 from 'd3';
import { TreatmentEvent, TreatmentEventsByUser } from '../../shared/api.js';
import { parseDate } from '../utils.js';

export function getSystemicTherapyTreatments(contents: string): TreatmentEventsByUser {
	const rows = parseRows(contents);
	return d3.group(rows, (d) => d.userID);
}

function parseRows(contents: string): TreatmentEvent[] {
	return d3.csvParse(contents).map((d) => {
		const event: TreatmentEvent = {
			userID: +d['ECA ID'],
			treatment: `${d['Type of Systemic Therapy']} - ${d['Treatment site']}`,
			detail: d['Name of systemic therapy'],
			// TODO: make sure date parsed correctly
			date: parseDate(d['Treatment date'])!,
			complete: d['Did the participant go to their appointment for [st_type]?'] === 'Yes',
			extras: {
				'The amount that the patient actually received':
					d['The amount that the patient actually received']
			}
		};

		return event;
	});
}
