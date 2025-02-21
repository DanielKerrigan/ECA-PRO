import { CalendarDate } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function dateToCalendarDate(date: Date): CalendarDate {
	return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

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

export function capitalize(x: string): string {
	if (x.length === 0) {
		return x;
	}
	return x[0].toLocaleUpperCase() + x.slice(1);
}
