import * as d3 from 'd3';
import { parseNumber } from '../../shared/utils.js';
import { RadiationEvent, RadiationTreatment, RadiationTreatmentByUser } from '../../shared/api.js';

type Row = {
	recordId: number;
	eventName: string;
	repeatInstrument: string;
	repeatInstance: number | null;
	date: Date | null;
	treatmentSite: string;
	totalDoseInitiallyPlanned: number | null;
	totalFractionsPlanned: number | null;
	changeInPlan: string;
	newTotalDosePlanned: number | null;
	newTotalFractionsPlanned: number | null;
	totalDoseRecievedOnThisDate: number | null;
	totalFractionsReceivedOnThisDate: number | null;
	hasPatientNoShowedAnyAppts: string;
	datePatientNoShowed: Date | null;
	reasonForNoShows: string;
	systemicTherapyGiven: string;
	isComplete: string;
};

export function getRadiationTreatments(contents: string): RadiationTreatmentByUser {
	const rows = getRows(contents);

	return d3.rollup(
		rows,
		(g) => handlePatient(g),
		(d) => d.recordId
	);
}

function getRows(contents: string): Row[] {
	const dateSpecifier = '%Y-%m-%d';
	const parseDate = d3.timeParse(dateSpecifier);

	return d3.csvParse(contents, (d) => {
		const row: Row = {
			recordId: +d['Record ID'],
			eventName: d['Event Name'],
			repeatInstrument: d['Repeat Instrument'],
			repeatInstance: parseNumber(d['Repeat Instance']),
			date: parseDate(d['Radiation date']),
			treatmentSite: d['Site of treatment'],
			totalDoseInitiallyPlanned: parseNumber(d['Total radiation dose initially planned']),
			totalFractionsPlanned: parseNumber(d['Total number of radiation fractions planned']),
			changeInPlan: d['Change in radiation plan'],
			newTotalDosePlanned: parseNumber(d['New total radiation dose planned']),
			newTotalFractionsPlanned: parseNumber(d['New total number of radiation fractions planned']),
			totalDoseRecievedOnThisDate: parseNumber(d['Total radiation dose received on this date']),
			totalFractionsReceivedOnThisDate: parseNumber(
				d['Total number of radiation fractions received on this date']
			),
			hasPatientNoShowedAnyAppts: d['Has the patient no-showed any of their appointments?'],
			datePatientNoShowed: parseDate(d['Date the patient no-showed to radiation appointment']),
			reasonForNoShows: d['Reason for no-shows'],
			systemicTherapyGiven: d['Was systemic therapy given?'],
			isComplete: d['Complete?']
		};

		return row;
	});
}

function handlePatient(rows: Row[]): RadiationTreatment {
	const baseline = rows[0];

	// skip the initial set of week rows
	let i = 1;
	while (!rows[i].eventName.includes('Exit')) {
		i += 1;
	}
	// skip the initial exit row
	i += 1;

	const events: RadiationEvent[] = [];
	while (!rows[i].eventName.includes('Exit')) {
		const row = rows[i];

		if (row.date !== null) {
			const event = {
				date: row.date,
				site: row.treatmentSite,
				dose: row.totalDoseRecievedOnThisDate,
				fractions: row.totalFractionsReceivedOnThisDate
			};
			events.push(event);
		}

		i += 1;
	}

	const exit = rows[i];

	const treatment: RadiationTreatment = {
		totalDoseInitiallyPlanned: baseline.totalDoseInitiallyPlanned,
		totalFractionsPlanned: baseline.totalFractionsPlanned,
		changeInPlan: baseline.changeInPlan,
		newTotalDosePlanned: baseline.newTotalDosePlanned,
		newTotalFractionsPlanned: baseline.newTotalFractionsPlanned,
		events
	};

	return treatment;
}
