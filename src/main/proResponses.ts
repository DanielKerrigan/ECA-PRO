import type { PROMetaByID, PROResponse, PROItem, PROUsersResponses } from '../shared/api.js';

import * as d3 from 'd3';

export function getPROResponses(
	dataContents: string,
	proMetaByID: PROMetaByID,
	dateParse: (d: string) => Date | null
): PROResponse[] {
	return (
		d3
			.csvParse(dataContents, (d) => {
				const itemID = +d.ItemID;
				const responseValue = +d.ResponseValue;
				const responseText = d.ResponseText;
				// TODO: properly handle this type
				const item = proMetaByID.get(itemID) as PROItem;

				const numResponses = item.responseItemStrings.length;
				// TODO: verify that Prefer not to say is the last response value
				const normalizedResponseValue =
					responseText === 'Prefer not to say' ? -1 : responseValue / (numResponses - 1);
				return {
					userID: +d.UserID,
					dateTime: dateParse(d.DateTime),
					itemID,
					responseValue,
					normalizedResponseValue,
					responseText
				};
			})
			// TODO: better handle when the date is missing
			.filter((d): d is PROResponse => d.dateTime !== null)
	);
}

export function groupPROResponses(responses: PROResponse[]): PROUsersResponses {
	return d3.rollup(
		responses,
		(g) => g.sort((a, b) => d3.ascending(a.dateTime, b.dateTime)),
		(d) => d.userID,
		(d) => d.itemID
	);
}
