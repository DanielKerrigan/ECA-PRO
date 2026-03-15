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

export const preferNotToSay = 'Prefer not to say';
export const notApplicable = 'Not applicable';
export const notSexuallyActive = 'Not sexually active';

export const specialTextToValue: Record<string, number> = {
	[preferNotToSay]: -100,
	[notApplicable]: -101,
	[notSexuallyActive]: -102
};
