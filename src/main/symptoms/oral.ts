import * as d3 from 'd3';
import { TreatmentEvent } from '../../shared/api.js';

export function getOralTreatments(contents: string): TreatmentEvent[] {
	const rows = parseRows(contents);
	return rows;
}

function parseRows(contents: string): TreatmentEvent[] {
	const parseDate = d3.timeParse('%-m/%-d/%Y');

	const category = 'Oral';

	return d3.csvParse(contents).map((d) => {
		const detail = d['Name of oral therapy medication'];

		const event: TreatmentEvent = {
			userID: +d['ECA ID'],
			kind: 'range',
			category,
			detail,
			// TODO: make sure date parsed correctly
			date: parseDate(d['Start date of oral therapy medication'])!,
			stopDate: parseDate(d['Date the oral therapy was discontinued']),
			complete: true,
			extras: {}
		};

		return event;
	});
}
