import * as d3 from 'd3';
import { TreatmentEvent } from '../../shared/api.js';

export function getSurgeries(contents: string): TreatmentEvent[] {
	const rows = parseRows(contents);
	return rows;
}

function parseRows(contents: string): TreatmentEvent[] {
	const parseDate = d3.timeParse('%Y-%m-%d');

	const category = 'Surgery';

	return d3.csvParse(contents).map((d) => {
		const detail = d['Name of surgery/surgery site'];

		const event: TreatmentEvent = {
			kind: 'single',
			userID: +d['ECA ID'],
			category,
			detail,
			// TODO: make sure date parsed correctly
			date: parseDate(d['Date of surgery '])!,
			stopDate: null,
			complete: true,
			extras: {}
		};

		return event;
	});
}
