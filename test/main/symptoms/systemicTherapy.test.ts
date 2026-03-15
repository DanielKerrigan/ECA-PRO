import { getSystemicTherapySchema } from '../../../src/main/symptoms/systemicTherapy.js';

import { expect, test } from 'vitest';
import * as d3 from 'd3';

test('getSystemicTherapySchema', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const exampleDateStrings = ['2026-03-01', '3/1/2026'];
	const date = parsers[0]('2026-03-01');

	const Schema = getSystemicTherapySchema(parsers, exampleDateStrings);

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Name of [st_type]': 'C',
			'Treatment date': '2026-03-01',
			'The amount of [st_type] that the patient actually received': '2'
		}).data
	).toStrictEqual({
		kind: 'single',
		userId: 1,
		category: 'Systemic therapy',
		detail: 'C - B',
		date,
		stopDate: null,
		missed: false,
		extras: [{ label: 'The amount that the patient actually received', value: '2' }]
	});

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Name of [st_type]': 'C',
			'Treatment date': '2026-03-01',
			'The amount of [st_type] that the patient actually received': ''
		}).data
	).toStrictEqual({
		kind: 'single',
		userId: 1,
		category: 'Systemic therapy',
		detail: 'C - B',
		date,
		stopDate: null,
		missed: true,
		extras: []
	});

	expect(
		Schema.safeParse({
			'ECA ID': '',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Name of [st_type]': 'C',
			'Treatment date': '2026-03-01',
			'The amount of [st_type] that the patient actually received': '2'
		}).error?.message
	).toContain('ECA ID');

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': '',
			'Name of [st_type]': 'C',
			'Treatment date': '2026-03-01',
			'The amount of [st_type] that the patient actually received': '2'
		}).error?.message
	).toContain('Treatment site');

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Name of [st_type]': '',
			'Treatment date': '2026-03-01',
			'The amount of [st_type] that the patient actually received': '2'
		}).error?.message
	).toContain('Name of [st_type]');

	expect(
		Schema.safeParse({
			'ECA ID': '1',
			'Event Name': 'A',
			'Treatment site': 'B',
			'Name of [st_type]': 'C',
			'Treatment date': '',
			'The amount of [st_type] that the patient actually received': '2'
		}).error?.message
	).toContain('Treatment date');
});
