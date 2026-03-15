import { FileResults } from '../shared/api.js';
import * as d3 from 'd3';
import { z } from 'zod';

// from https://github.com/sindresorhus/strip-bom
// see https://d3js.org/d3-dsv#byte-order-marks for more info
export function stripBom(str: string): string {
	if (typeof str !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof str}`);
	}

	// Catches EFBBBF (UTF-8 BOM) because the buffer-to-string
	// conversion translates it to FEFF (UTF-16 BOM).
	if (str.charCodeAt(0) === 0xfeff) {
		return str.slice(1);
	}

	return str;
}

export function getFileData<T>(contents: string, schema: z.ZodType<T>): FileResults<T> {
	const rawRows = d3.csvParse(contents);

	const rows: T[] = [];
	const errors: string[] = [];

	rawRows.forEach((rawRow, i) => {
		const result = schema.safeParse(rawRow);
		if (result.success) {
			rows.push(result.data);
		} else {
			errors.push(`Row ${i + 2}: ${result.error.message}`);
		}
	});

	return {
		rows,
		errors
	};
}

export function zodInteger(columnName: string) {
	return z
		.string()
		.trim()
		.min(1, `"${columnName}" cannot be empty`)
		.refine((val) => !isNaN(Number(val)), `"${columnName}" must be a number`)
		.transform(Number)
		.pipe(z.int(`"${columnName}" must be a whole number`));
}

export function zodNonEmptyString(columnName: string) {
	return z.string().trim().min(1, `"${columnName}" cannot be empty`);
}

export const exampleDate = new Date();

export function isValidDate(maybeDate: any): boolean {
	return maybeDate instanceof Date && !isNaN(maybeDate.getTime());
}

export function parseDate(
	dateString: string,
	dateParsers: ((dateString: string) => Date | null)[]
): Date | null {
	for (const parser of dateParsers) {
		const date = parser(dateString);
		if (isValidDate(date)) {
			return date;
		}
	}
	return null;
}

export function zodDate(
	columnName: string,
	dateParsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
) {
	return z
		.string()
		.trim()
		.min(1, `"${columnName}" cannot be empty`)
		.transform((d) => parseDate(d, dateParsers))
		.pipe(
			z.date(
				`"${columnName}" is expected to be in one of these formats: ${exampleDateStrings.join(', ')}`
			)
		);
}

export function zodOptionalDate(
	columnName: string,
	dateParsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
) {
	return z
		.string()
		.trim()
		.transform((d) => (d === '' ? undefined : parseDate(d, dateParsers)))
		.refine(
			(d) => d === undefined || d instanceof Date,
			`"${columnName}" is expected to be in one of these formats: ${exampleDateStrings.join(', ')}`
		)
		.transform((d) => d ?? null);
}
