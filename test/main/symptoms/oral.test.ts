import { getOralSchema } from '../../../src/main/symptoms/oral.js';

import { expect, test } from 'vitest';
import * as d3 from 'd3';

test('getOralSchema', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const exampleDateStrings = ['2026-03-01', '3/1/2026'];
	const date1 = parsers[0]('2026-03-01');
	const date2 = parsers[0]('2026-03-02');

	const Schema = getOralSchema(parsers, exampleDateStrings);

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Event Name': 'A',
			'Name of oral therapy medication': 'B',
			'Start date of oral therapy medication': '2026-03-01',
			'Date the oral therapy was discontinued': '2026-03-02'
		}).data
	).toStrictEqual({
		userId: 0,
		kind: 'range',
		category: 'Oral',
		detail: 'B',
		date: date1,
		stopDate: date2,
		missed: false,
		extras: []
	});

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Event Name': 'A',
			'Name of oral therapy medication': 'B',
			'Start date of oral therapy medication': '2026-03-01',
			'Date the oral therapy was discontinued': ''
		}).data
	).toStrictEqual({
		userId: 0,
		kind: 'range',
		category: 'Oral',
		detail: 'B',
		date: date1,
		stopDate: null,
		missed: false,
		extras: []
	});

	expect(
		Schema.safeParse({
			'ECA ID': '',
			'Event Name': 'A',
			'Name of oral therapy medication': 'B',
			'Start date of oral therapy medication': '2026-03-01',
			'Date the oral therapy was discontinued': '2026-03-02'
		}).error?.message
	).toContain('ECA ID');

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Event Name': 'A',
			'Name of oral therapy medication': '',
			'Start date of oral therapy medication': '2026-03-01',
			'Date the oral therapy was discontinued': '2026-03-02'
		}).error?.message
	).toContain('Name of oral therapy medication');

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Event Name': 'A',
			'Name of oral therapy medication': 'B',
			'Start date of oral therapy medication': '',
			'Date the oral therapy was discontinued': '2026-03-02'
		}).error?.message
	).toContain('Start date of oral therapy medication');

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Event Name': 'A',
			'Name of oral therapy medication': 'B',
			'Start date of oral therapy medication': '2026-03-01',
			'Date the oral therapy was discontinued': 'test'
		}).error?.message
	).toContain('Date the oral therapy was discontinued');
});
