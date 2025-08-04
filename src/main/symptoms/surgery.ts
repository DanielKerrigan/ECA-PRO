import * as d3 from 'd3';
import { SingleTreatmentEvent } from '../../shared/api.js';

export function getSurgeries(contents: string): SingleTreatmentEvent[] {
	const rows = parseRows(contents);
	return rows;
}

function parseRows(contents: string): SingleTreatmentEvent[] {
	const parseDate = d3.timeParse('%Y-%m-%d');

	const category = 'Surgery';

	return d3.csvParse(contents).map((d) => {
		const detail = d['Name of surgery/surgery site'];

		const event: SingleTreatmentEvent = {
			kind: 'single',
			userID: +d['ECA ID'],
			category,
			detail,
			// TODO: make sure date parsed correctly
			date: parseDate(d['Date of surgery '])!,
			stopDate: null,
			missed: false,
			extras: []
		};

		return event;
	});
}
