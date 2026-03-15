import { getSurgerySchema } from '../../../src/main/symptoms/surgery.js';

import { expect, test } from 'vitest';
import * as d3 from 'd3';

test('getSurgerySchema', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const exampleDateStrings = ['2026-03-01', '3/1/2026'];
	const date = parsers[0]('2026-03-01');

	const Schema = getSurgerySchema(parsers, exampleDateStrings);

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Date of surgery': '2026-03-01',
			'Name of surgery/surgery site': 'C'
		}).data
	).toStrictEqual({
		kind: 'single',
		userId: 1,
		category: 'Surgery',
		detail: 'C',
		date,
		stopDate: null,
		missed: false,
		extras: []
	});

	expect(
		Schema.safeParse({
			'ECA ID': '',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Date of surgery': '2026-03-01',
			'Name of surgery/surgery site': 'C'
		}).error?.message
	).toContain('ECA ID');

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': '',
			'Date of surgery': '2026-03-01',
			'Name of surgery/surgery site': 'C'
		}).error?.message
	).toContain('Treatment site');

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Date of surgery': '',
			'Name of surgery/surgery site': 'C'
		}).error?.message
	).toContain('Date of surgery');

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Date of surgery': '2026-03-01',
			'Name of surgery/surgery site': ''
		}).error?.message
	).toContain('Name of surgery/surgery site');
});
