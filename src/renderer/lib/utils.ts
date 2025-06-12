import { CalendarDate } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, 'child'> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, 'children'> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function dateToCalendarDate(date: Date): CalendarDate {
	return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}

export function capitalize(x: string): string {
	if (x.length === 0) {
		return x;
	}
	return x[0].toLocaleUpperCase() + x.slice(1);
}
