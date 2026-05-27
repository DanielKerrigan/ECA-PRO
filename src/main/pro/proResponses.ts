import type { FileResults, ProResponse, ProUsersResponses, ProItem } from '../../shared/api.js';
import { exampleDate, getFileData, zodDate, zodInteger, zodNonEmptyString } from '../utils.js';

import { z } from 'zod';
import * as d3 from 'd3';

export function getProResponseSchema(
	parsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[],
	proItemById: Map<number, ProItem>
) {
	const Schema = z
		.object({
			responseID: zodInteger(),
			UserID: zodInteger(),
			DateTime: zodDate(parsers, exampleDateStrings),
			ItemID: zodInteger(),
			ResponseValue: zodInteger(),
			ResponseText: zodNonEmptyString()
		})
		.refine((v) => proItemById.has(v.ItemID), `Cannot find ItemID in the PRO items metadata.`)
		.superRefine((val, ctx) => {
			if (!proItemById.has(val.ItemID)) {
				ctx.addIssue({
					code: 'custom',
					message: `Cannot find "ItemID" "${val.ItemID}" in the PRO items metadata.`
				});
				return;
			}

			const item = proItemById.get(val.ItemID)!;

			// Invalid response value for the given response type
			// We will filter these out rather than creating an error message for them
			if (val.ResponseValue === -1) {
				return;
			}

			if (!item.textToValue.has(val.ResponseText)) {
				ctx.addIssue({
					code: 'custom',
					message: `Cannot match "ResponseText" "${val.ResponseText}" with PRO item metadata.`
				});
				return;
			}

			const value = item.textToValue.get(val.ResponseText)!;

			// -2 represents an invalid response type
			// We can still use the ResponseText to get the correct value
			if (val.ResponseValue !== -2 && val.ResponseValue !== value) {
				ctx.addIssue({
					code: 'custom',
					message: `"ResponseValue" ${val.ResponseValue} does not match the expected value ${value}.`
				});
				return;
			}
		})
		.transform((d): ProResponse => {
			const item = proItemById.get(d.ItemID)!;

			const responseValue = item.textToValue.get(d.ResponseText) ?? d.ResponseValue;
			// TODO: handle this better
			const normalizedResponseValue = item.valueToNormalizedValue.get(responseValue) ?? -1;

			return {
				responseId: d.responseID,
				userId: d.UserID,
				dateTime: d.DateTime,
				key: item.key,
				itemId: d.ItemID,
				responseValue,
				normalizedResponseValue,
				responseText: d.ResponseText
			};
		});

	return Schema;
}

export function getProResponses(
	contents: string,
	proItemById: Map<number, ProItem>
): FileResults<ProResponse> {
	const specifiers = ['%Y-%m-%d %H:%M:%S', '%_m/%_d/%Y %_H:%M'];
	const parsers = specifiers.map((specifier) => d3.timeParse(specifier));
	const exampleDateStrings = specifiers.map((specifier) => d3.timeFormat(specifier)(exampleDate));

	const Schema = getProResponseSchema(parsers, exampleDateStrings, proItemById);

	const { rows, errors } = getFileData(contents, Schema);

	const filteredRows = rows.filter((r) => r.responseValue !== -1);

	return {
		rows: filteredRows,
		errors
	};
}

export function groupProResponses(responses: ProResponse[]): ProUsersResponses {
	return d3.rollup(
		responses,
		(g) => g.sort((a, b) => d3.ascending(a.dateTime, b.dateTime)),
		(d) => d.userId,
		(d) => d.key
	);
}
