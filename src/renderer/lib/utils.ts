import { CalendarDate } from '@internationalized/date';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function dateToCalendarDate(date: Date): CalendarDate {
	return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
}
