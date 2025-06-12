import * as d3 from 'd3';

export const parseDate = d3.timeParse('%Y-%m-%d');

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
