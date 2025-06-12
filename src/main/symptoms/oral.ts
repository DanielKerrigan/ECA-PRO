import * as d3 from 'd3';
import { OralTreatmentEvent, OralTreatmentEventsByUser } from '../../shared/api.js';
import { parseDate } from '../utils.js';

export function getOralTreatments(contents: string): OralTreatmentEventsByUser {
	const rows = parseRows(contents);
	return d3.group(rows, (d) => d.userID);
}

function parseRows(contents: string): OralTreatmentEvent[] {
	return d3.csvParse(contents).map((d) => {
		const event: OralTreatmentEvent = {
			userID: +d['ECA ID'],
			treatment: 'Oral',
			detail: d['oral_name'],
			// TODO: make sure date parsed correctly
			startDate: parseDate(d['oral_start'])!,
			stopDate: parseDate(d['oral_stopdt'])
		};

		return event;
	});
}
