import { getRadiationSchema } from '../../../src/main/symptoms/radiation.js';

import { expect, test } from 'vitest';
import * as d3 from 'd3';

test('getRadiationSchema', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const exampleDateStrings = ['2026-03-01', '3/1/2026'];
	const date = parsers[0]('2026-03-01');

	const Schema = getRadiationSchema(parsers, exampleDateStrings);

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Treatment site': 'A',
			'Date of radiation appointment': '2026-03-01',
			'Total radiation dose received on this date': '1',
			'Total number of radiation fractions received on this date': '2',
			'Total radiation dose planned': '3',
			'Total number of radiation fractions planned': '4'
		}).data
	).toStrictEqual({
		kind: 'single',
		userId: 0,
		category: 'Radiation',
		detail: '3 Gy in 4 fx to A',
		date: date,
		stopDate: null,
		missed: false,
		extras: [
			{ label: 'Total radiation dose received on this date', value: '1' },
			{
				label: 'Total number of radiation fractions received on this date',
				value: '2'
			}
		]
	});

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Treatment site': 'A',
			'Date of radiation appointment': '2026-03-01',
			'Total radiation dose received on this date': '',
			'Total number of radiation fractions received on this date': '',
			'Total radiation dose planned': '3',
			'Total number of radiation fractions planned': '4'
		}).data
	).toStrictEqual({
		kind: 'single',
		userId: 0,
		category: 'Radiation',
		detail: '3 Gy in 4 fx to A',
		date: date,
		stopDate: null,
		missed: true,
		extras: []
	});

	expect(
		Schema.safeParse({
			'ECA ID': '',
			'Treatment site': 'A',
			'Date of radiation appointment': '2026-03-01',
			'Total radiation dose received on this date': '',
			'Total number of radiation fractions received on this date': '',
			'Total radiation dose planned': '3',
			'Total number of radiation fractions planned': '4'
		}).error?.message
	).toContain('ECA ID');

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Treatment site': '',
			'Date of radiation appointment': '2026-03-01',
			'Total radiation dose received on this date': '',
			'Total number of radiation fractions received on this date': '',
			'Total radiation dose planned': '3',
			'Total number of radiation fractions planned': '4'
		}).error?.message
	).toContain('Treatment site');

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Treatment site': 'A',
			'Date of radiation appointment': '',
			'Total radiation dose received on this date': '',
			'Total number of radiation fractions received on this date': '',
			'Total radiation dose planned': '3',
			'Total number of radiation fractions planned': '4'
		}).error?.message
	).toContain('Date of radiation appointment');

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Treatment site': 'A',
			'Date of radiation appointment': '2026-03-01',
			'Total radiation dose received on this date': '',
			'Total number of radiation fractions received on this date': '',
			'Total radiation dose planned': '',
			'Total number of radiation fractions planned': '4'
		}).error?.message
	).toContain('Total radiation dose planned');

	expect(
		Schema.safeParse({
			'ECA ID': '0',
			'Treatment site': 'A',
			'Date of radiation appointment': '2026-03-01',
			'Total radiation dose received on this date': '',
			'Total number of radiation fractions received on this date': '',
			'Total radiation dose planned': '3',
			'Total number of radiation fractions planned': ''
		}).error?.message
	).toContain('Total number of radiation fractions planned');
});
