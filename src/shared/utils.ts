export function min<T>(a: T, b: T): T {
	if (a <= b) {
		return a;
	}
	return b;
}

export function max<T>(a: T, b: T): T {
	if (a >= b) {
		return a;
	}
	return b;
}

export function parseNumber(x: string): number | null {
	if (x === '') {
		return null;
	}

	return +x;
}
