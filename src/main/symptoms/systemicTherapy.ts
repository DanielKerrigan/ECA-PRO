import * as d3 from 'd3';
import { TreatmentEvent } from '../../shared/api.js';

export function getSystemicTherapyTreatments(contents: string): TreatmentEvent[] {
	const rows = parseRows(contents);
	return rows;
}

function parseRows(contents: string): TreatmentEvent[] {
	const parseDate = d3.timeParse('%Y-%m-%d');

	const category = 'Systemic therapy';

	return d3.csvParse(contents).map((d) => {
		const detail = `${d['Name of [st_type]']} - ${d['Treatment site']}`;

		const event: TreatmentEvent = {
			kind: 'single',
			userID: +d['ECA ID'],
			category,
			detail,
			// TODO: make sure date parsed correctly
			date: parseDate(d['Treatment date'])!,
			stopDate: null,
			complete: d['Did the participant go to their appointment for [st_type]?'] === 'Yes',
			extras: {
				'The amount that the patient actually received':
					d['The amount that the patient actually received']
			}
		};

		return event;
	});
}
