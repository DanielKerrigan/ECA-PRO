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
	const errors: FileResults<T>['errors'] = [];

	rawRows.forEach((rawRow, i) => {
		const result = schema.safeParse(rawRow);
		if (result.success) {
			rows.push(result.data);
		} else {
			z.flattenError(result.error);
			errors.push({
				row: i + 2,
				errors: z.flattenError(result.error)
			});
		}
	});

	return {
		rows,
		errors
	};
}

export function zodRequiredString() {
	return z.string('required').trim();
}

export function zodNonEmptyString() {
	return zodRequiredString().min(1, 'cannot be empty');
}

export function zodInteger() {
	return zodNonEmptyString()
		.refine((val) => !isNaN(Number(val)), 'must be a number')
		.transform(Number)
		.pipe(z.int('must be a whole number'));
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
	dateParsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
) {
	return zodNonEmptyString()
		.transform((d) => parseDate(d, dateParsers))
		.pipe(z.date(`expected to be in one of these formats: ${exampleDateStrings.join(', ')}`));
}

export function zodOptionalDate(
	dateParsers: ((dateString: string) => Date | null)[],
	exampleDateStrings: string[]
) {
	return zodRequiredString()
		.transform((d) => (d === '' ? undefined : parseDate(d, dateParsers)))
		.refine(
			(d) => d === undefined || d instanceof Date,
			`expected to be in one of these formats: ${exampleDateStrings.join(', ')}`
		)
		.transform((d) => d ?? null);
}
