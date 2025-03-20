import type {
	PROMetaByID,
	PROResponse,
	PROUserConstructOrders,
	PROUsersConstructOrders
} from '../../shared/api.js';

import * as d3 from 'd3';
import { max } from '../../shared/utils.js';

function compareRecentSeverity(
	a: { [key: string]: any; meanNormalizedValue: number; numResponses: number },
	b: { [key: string]: any; meanNormalizedValue: number; numResponses: number }
): number {
	if (a.meanNormalizedValue === b.meanNormalizedValue) {
		return d3.descending(a.numResponses, b.numResponses);
	}

	return d3.descending(a.meanNormalizedValue, b.meanNormalizedValue);
}

type ConstructInfo = {
	index: number;
	meanNormalizedValue: number;
	numResponses: number;
};

function getConstructInfo(
	constructResponses: PROResponse[],
	proMetaByID: PROMetaByID,
	recentStart: Date,
	recentEnd: Date
): ConstructInfo {
	const index =
		d3.min(constructResponses, (d) => {
			const item = proMetaByID.get(d.itemID);
			return item?.index;
		}) ?? Infinity;

	const recentResponses = constructResponses.filter(
		(d) => d.dateTime >= recentStart && d.dateTime <= recentEnd
	);

	if (recentResponses.length === 0) {
		return {
			index,
			meanNormalizedValue: 0,
			numResponses: 0
		};
	}

	const { meanNormalizedValue, numResponses } = d3
		.rollups(
			recentResponses,
			(responses) => {
				const completeResponses = responses.filter((d) => d.normalizedResponseValue !== -1);
				const numResponses = completeResponses.length;
				const meanNormalizedValue =
					d3.mean(completeResponses, (d) => d.normalizedResponseValue) ?? 0;

				return {
					numResponses,
					meanNormalizedValue
				};
			},
			(d) => d.itemID
		)
		.map((d) => d[1])
		.sort(compareRecentSeverity)[0];

	return {
		index,
		meanNormalizedValue,
		numResponses
	};
}

function getUserConstructOrders(
	allUserResponses: PROResponse[],
	proMetaByID: PROMetaByID
): PROUserConstructOrders {
	// TODO: better handle dates being undefined
	const [minDate, maxDate] = d3.extent(allUserResponses, (d) => d.dateTime) as [Date, Date];
	const recentStart = max(minDate, d3.timeDay.floor(d3.timeWeek.offset(maxDate, -1)));
	const recentEnd = maxDate;

	const constructs = d3.rollups(
		allUserResponses,
		(constructResponses) =>
			getConstructInfo(constructResponses, proMetaByID, recentStart, recentEnd),
		(d) => {
			const item = proMetaByID.get(d.itemID);
			return item?.constructName;
		}
	);

	const constructsSortedByIndex = constructs
		.slice()
		.sort((a, b) => d3.ascending(a[1].index, b[1].index));

	const constructsSortedBySeverity = constructs
		.slice()
		.sort((a, b) => compareRecentSeverity(a[1], b[1]));

	return {
		category: {
			order: constructsSortedByIndex.map((d) => d[0]).filter((d) => d !== undefined)
		},
		severity: {
			startDate: recentStart,
			endDate: recentEnd,
			order: constructsSortedBySeverity.map((d) => d[0]).filter((d) => d !== undefined)
		}
	};
}

export function getUsersConstructOrders(
	proMetaByID: PROMetaByID,
	allProReponses: PROResponse[]
): PROUsersConstructOrders {
	return d3.rollup(
		allProReponses,
		(allUserResponses) => getUserConstructOrders(allUserResponses, proMetaByID),
		(d) => d.userID
	);
}
