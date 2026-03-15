import {
	zodInteger,
	zodNonEmptyString,
	isValidDate,
	parseDate,
	zodDate,
	zodOptionalDate
} from '../../src/main/utils.js';

import { expect, test } from 'vitest';
import * as d3 from 'd3';

test('zodInteger', () => {
	const Schema = zodInteger('A');

	expect(Schema.safeParse('0').data).toBe(0);
	expect(Schema.safeParse('1').data).toBe(1);
	expect(Schema.safeParse('2').data).toBe(2);
	expect(Schema.safeParse('-2').data).toBe(-2);
	expect(Schema.safeParse('-100').data).toBe(-100);
	expect(Schema.safeParse('1.0').data).toBe(1);

	expect(Schema.safeParse('').success).toBe(false);
	expect(Schema.safeParse(null).success).toBe(false);
	expect(Schema.safeParse(undefined).success).toBe(false);
	expect(Schema.safeParse(false).success).toBe(false);
	expect(Schema.safeParse(true).success).toBe(false);
	expect(Schema.safeParse('null').success).toBe(false);
	expect(Schema.safeParse('undefined').success).toBe(false);
	expect(Schema.safeParse('false').success).toBe(false);
	expect(Schema.safeParse('true').success).toBe(false);
	expect(Schema.safeParse('1.1').success).toBe(false);
});

test('zodNonEmptyString', () => {
	const Schema = zodNonEmptyString('A');

	expect(Schema.safeParse('test').success).toBe(true);
	expect(Schema.safeParse('').success).toBe(false);
});

test('isValidDate', () => {
	expect(isValidDate(new Date())).toBe(true);
	expect(isValidDate(new Date('test'))).toBe(false);
	expect(isValidDate(null)).toBe(false);
	expect(isValidDate(undefined)).toBe(false);
	expect(isValidDate(Date.now())).toBe(false);
});

test('parseDate', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const date = parsers[0]('2026-03-01');

	expect(parseDate('2026-03-01', parsers)).toStrictEqual(date);
	expect(parseDate('3/1/2026', parsers)).toStrictEqual(date);
	expect(parseDate('3-1-2026', parsers)).toBe(null);
});

test('zodDate', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const date = parsers[0]('2026-03-01');

	const Schema = zodDate('A', parsers, ['2026-03-01', '3/1/2026']);

	expect(Schema.safeParse('2026-03-01').data).toStrictEqual(date);
	expect(Schema.safeParse('3/1/2026').data).toStrictEqual(date);

	expect(Schema.safeParse('3-1-2026').success).toBe(false);
	expect(Schema.safeParse(1).success).toBe(false);
	expect(Schema.safeParse(null).success).toBe(false);
	expect(Schema.safeParse(undefined).success).toBe(false);
});

test('zodOptionalDate', () => {
	const specifiers = ['%Y-%m-%d', '%-m/%-d/%Y'];
	const parsers = specifiers.map((s) => d3.timeParse(s));
	const date = parsers[0]('2026-03-01');

	const Schema = zodOptionalDate('A', parsers, ['2026-03-01', '3/1/2026']);

	expect(Schema.safeParse('2026-03-01').data).toStrictEqual(date);
	expect(Schema.safeParse('3/1/2026').data).toStrictEqual(date);
	expect(Schema.safeParse('').data).toBe(null);

	expect(Schema.safeParse('3-1-2026').success).toBe(false);
	expect(Schema.safeParse(1).success).toBe(false);
	expect(Schema.safeParse(null).success).toBe(false);
	expect(Schema.safeParse(undefined).success).toBe(false);
});
