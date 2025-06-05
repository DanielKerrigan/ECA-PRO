import type {
	MergedPROItem,
	PROMetaByKey,
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
	categoryName: string;
	constructName: string;
	meanNormalizedValue: number;
	numResponses: number;
};

function getConstructInfo(
	constructResponses: PROResponse[],
	proMetaByKey: PROMetaByKey,
	recentStart: Date,
	recentEnd: Date
): ConstructInfo {
	const key = constructResponses[0].key;
	const item = proMetaByKey.get(key);
	const categoryName = item?.categoryName ?? '';
	const constructName = item?.constructName ?? '';

	const recentResponses = constructResponses.filter(
		(d) => d.dateTime >= recentStart && d.dateTime <= recentEnd
	);

	if (recentResponses.length === 0) {
		return {
			categoryName,
			constructName,
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
		categoryName,
		constructName,
		meanNormalizedValue,
		numResponses
	};
}

function getUserConstructOrders(
	allUserResponses: PROResponse[],
	proMetaByKey: PROMetaByKey
): PROUserConstructOrders {
	// TODO: better handle dates being undefined
	const [minDate, maxDate] = d3.extent(allUserResponses, (d) => d.dateTime) as [Date, Date];
	const recentStart = max(minDate, d3.timeDay.floor(d3.timeWeek.offset(maxDate, -1)));
	const recentEnd = maxDate;

	const constructs = d3.rollups(
		allUserResponses,
		(constructResponses) =>
			getConstructInfo(constructResponses, proMetaByKey, recentStart, recentEnd),
		(d) => {
			const item = proMetaByKey.get(d.key);
			return item?.constructName;
		}
	);

	const constructsSortedByCategory = constructs
		.slice()
		.sort(
			(a, b) =>
				d3.ascending(a[1].categoryName, b[1].categoryName) ||
				d3.ascending(a[1].constructName, b[1].constructName)
		);

	const constructsSortedBySeverity = constructs
		.slice()
		.sort((a, b) => compareRecentSeverity(a[1], b[1]));

	return {
		category: {
			order: constructsSortedByCategory.map((d) => d[0]).filter((d) => d !== undefined)
		},
		severity: {
			startDate: recentStart,
			endDate: recentEnd,
			order: constructsSortedBySeverity.map((d) => d[0]).filter((d) => d !== undefined)
		}
	};
}

/**
 * Get the order that the constructs (symptoms) should show up in the PRO table
 * for each user.
 */
export function getUsersConstructOrders(
	proMetaByKey: PROMetaByKey,
	allProReponses: PROResponse[]
): PROUsersConstructOrders {
	return d3.rollup(
		allProReponses,
		(allUserResponses) => getUserConstructOrders(allUserResponses, proMetaByKey),
		(d) => d.userID
	);
}
