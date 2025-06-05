import type {
	PROResponse,
	MergedPROItem,
	PROUsersResponses,
	PROMetaByKey
} from '../../shared/api.js';

import * as d3 from 'd3';

export function getPROResponses(
	dataContents: string,
	proMetaByKey: PROMetaByKey,
	proItemIDToKey: Map<number, string>
): PROResponse[] {
	const dateParse = d3.timeParse('%Y-%m-%d %H:%M:%S');

	// TODO: type this better
	return (
		d3
			.csvParse(dataContents, (d) => {
				const itemID = +d.ItemID;
				const responseValue = +d.ResponseValue;
				const responseText = d.ResponseText;
				// TODO: properly handle this type
				const key = proItemIDToKey.get(itemID) as string;
				const item = proMetaByKey.get(key) as MergedPROItem;

				const normalizedResponseValue = item.normalizedResponseItemValues[responseValue];

				return {
					userID: +d.UserID,
					dateTime: dateParse(d.DateTime),
					key,
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
		(d) => d.key
	);
}
