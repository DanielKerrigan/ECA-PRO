import type {
	Data,
	ProUsersResponses,
	ProUsersConstructOrders,
	Settings,
	TreatmentEvent,
	FileResults
} from '../shared/api.js';
import { getProItems, mergeProItems, getProItemById } from './pro/proMeta.js';
import { getProResponses, groupProResponses } from './pro/proResponses.js';
import { getUsersConstructOrders } from './pro/proSymptomSorting.js';
import { getRadiationTreatments } from './symptoms/radiation.js';
import { getOralTreatments } from './symptoms/oral.js';
import { getSystemicTherapyTreatments } from './symptoms/systemicTherapy.js';
import { stripBom } from './utils.js';
import { getSurgeries } from './symptoms/surgery.js';

import * as fs from 'node:fs/promises';
import * as d3 from 'd3';

export function getData(settings: Settings): Promise<Data> {
	const promises = [
		fs.readFile(settings.proMetaPath, 'utf8'),
		fs.readFile(settings.proDataPath, 'utf8'),
		fs.readFile(settings.radiationPath, 'utf8'),
		fs.readFile(settings.systemicTherapyPath, 'utf8'),
		fs.readFile(settings.oralPath, 'utf8'),
		fs.readFile(settings.surgeryPath, 'utf8')
	];

	return Promise.allSettled(promises).then((values) => {
		const [
			proMetaResult,
			proDataResult,
			radiationResult,
			systemicTherapyResult,
			oralResult,
			surgeryResult
		] = values;

		// read PRO META data

		const defaultFileResult = {
			rows: [],
			errors: [
				{
					row: 0,
					errors: [
						{
							formErrors: ['cannot read file'],
							fieldErrors: {}
						}
					]
				}
			]
		};

		const proItems =
			proMetaResult.status === 'fulfilled'
				? getProItems(stripBom(proMetaResult.value))
				: defaultFileResult;
		const proMetaById = getProItemById(proItems.rows);
		const proMetaByKey = mergeProItems(proItems.rows);

		// read PRO responses

		const allProReponses =
			proDataResult.status === 'fulfilled'
				? getProResponses(stripBom(proDataResult.value), proMetaById)
				: defaultFileResult;
		const proUsersResponses: ProUsersResponses = groupProResponses(allProReponses.rows);

		const proUsersConstructOrders: ProUsersConstructOrders = getUsersConstructOrders(
			proMetaByKey,
			allProReponses.rows
		);

		// read treatment data

		const radiationTreatmentEvents =
			radiationResult.status === 'fulfilled'
				? getRadiationTreatments(stripBom(radiationResult.value))
				: defaultFileResult;

		const systemicTherapyTreatmentEvents =
			systemicTherapyResult.status === 'fulfilled'
				? getSystemicTherapyTreatments(stripBom(systemicTherapyResult.value))
				: defaultFileResult;

		const surgeryEvents =
			surgeryResult.status === 'fulfilled'
				? getSurgeries(stripBom(surgeryResult.value))
				: defaultFileResult;

		const oralTreatmentEvents =
			oralResult.status === 'fulfilled'
				? getOralTreatments(stripBom(oralResult.value))
				: defaultFileResult;

		const treatmentEvents = ([] as TreatmentEvent[]).concat(
			radiationTreatmentEvents.rows,
			systemicTherapyTreatmentEvents.rows,
			surgeryEvents.rows,
			oralTreatmentEvents.rows
		);

		const treatmentEventsByUser = d3.group(treatmentEvents, (d) => d.userId);

		const result = {
			proMetaByKey,
			proUsersResponses,
			proUsersConstructOrders,
			treatmentEventsByUser,
			errors: {
				proMeta: proItems.errors,
				proData: allProReponses.errors,
				radiation: radiationTreatmentEvents.errors,
				systemicTherapy: systemicTherapyTreatmentEvents.errors,
				oral: oralTreatmentEvents.errors,
				surgery: surgeryEvents.errors
			}
		};

		return result;
	});
}
