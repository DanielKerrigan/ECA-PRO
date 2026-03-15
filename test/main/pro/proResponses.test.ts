import { getProResponseSchema } from '../../../src/main/pro/proResponses.js';

import { expect, test } from 'vitest';
import * as d3 from 'd3';

test('getProResponseSchema', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const exampleDateStrings = ['2026-03-01', '3/1/2026'];
	const date = parsers[0]('2026-03-01');

	const proItemById = new Map([
		[
			2,
			{
				key: 'B_C',
				itemId: 2,
				item: 'A',
				constructName: 'B',
				responseItemType: 'C',
				bankName: 'G',
				categoryName: 'H',
				textToValue: new Map([
					['D', 0],
					['E', 1],
					['F', 2],
					['Not applicable', -101],
					['Prefer not to say', -100]
				]),
				valueToNormalizedValue: new Map([
					[0, 0],
					[1, 0.5],
					[2, 1],
					[-101, -101],
					[-100, -100]
				])
			}
		]
	]);

	const Schema = getProResponseSchema(parsers, exampleDateStrings, proItemById);

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '0',
			ResponseText: 'D'
		}).data
	).toStrictEqual({
		responseId: 0,
		userId: 1,
		dateTime: date,
		key: 'B_C',
		itemId: 2,
		responseValue: 0,
		normalizedResponseValue: 0,
		responseText: 'D'
	});

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '-100',
			ResponseText: 'Prefer not to say'
		}).data
	).toStrictEqual({
		responseId: 0,
		userId: 1,
		dateTime: date,
		key: 'B_C',
		itemId: 2,
		responseValue: -100,
		normalizedResponseValue: -100,
		responseText: 'Prefer not to say'
	});

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '-101',
			ResponseText: 'Not applicable'
		}).data
	).toStrictEqual({
		responseId: 0,
		userId: 1,
		dateTime: date,
		key: 'B_C',
		itemId: 2,
		responseValue: -101,
		normalizedResponseValue: -101,
		responseText: 'Not applicable'
	});

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '-2',
			ResponseText: 'F'
		}).data
	).toStrictEqual({
		responseId: 0,
		userId: 1,
		dateTime: date,
		key: 'B_C',
		itemId: 2,
		responseValue: 2,
		normalizedResponseValue: 1,
		responseText: 'F'
	});

	expect(
		Schema.safeParse({
			responseID: '',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '0',
			ResponseText: 'D'
		}).error?.message
	).toContain('responseID');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '0',
			ResponseText: 'D'
		}).error?.message
	).toContain('UserID');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '',
			ItemID: '2',
			ResponseValue: '0',
			ResponseText: 'D'
		}).error?.message
	).toContain('DateTime');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '',
			ResponseValue: '0',
			ResponseText: 'D'
		}).error?.message
	).toContain('ItemID');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '',
			ResponseText: 'D'
		}).error?.message
	).toContain('ResponseValue');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '0',
			ResponseText: ''
		}).error?.message
	).toContain('ResponseText');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '9',
			ResponseValue: '0',
			ResponseText: 'D'
		}).error?.message
	).toContain('ItemID');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '0',
			ResponseText: 'Z'
		}).error?.message
	).toContain('ResponseText');

	expect(
		Schema.safeParse({
			responseID: '0',
			UserID: '1',
			DateTime: '2026-03-01',
			ItemID: '2',
			ResponseValue: '1',
			ResponseText: 'D'
		}).error?.message
	).toContain('ResponseValue');
});
