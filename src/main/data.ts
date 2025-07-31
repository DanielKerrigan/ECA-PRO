import type {
	Data,
	PROUsersResponses,
	PROResponse,
	PROUsersConstructOrders,
	PROItem,
	Settings,
	TreatmentEvent
} from '../shared/api.js';

import * as fs from 'node:fs/promises';
import * as d3 from 'd3';
import { getPROItems, mergePROItems, getPROItemIDToKey } from './pro/proMeta.js';
import { getPROResponses, groupPROResponses } from './pro/proResponses.js';
import { getUsersConstructOrders } from './pro/proSymptomSorting.js';
import { getRadiationTreatments } from './symptoms/radiation.js';
import { getOralTreatments } from './symptoms/oral.js';
import { getSystemicTherapyTreatments } from './symptoms/systemicTherapy.js';
import { stripBom } from './utils.js';
import { getSurgeries } from './symptoms/surgery.js';

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

		const proItems: PROItem[] =
			proMetaResult.status === 'fulfilled' ? getPROItems(stripBom(proMetaResult.value)) : [];
		const proMetaByKey = mergePROItems(proItems);
		const proItemIDToKey = getPROItemIDToKey(proItems);

		// read PRO responses

		const allProReponses: PROResponse[] =
			proDataResult.status === 'fulfilled'
				? getPROResponses(stripBom(proDataResult.value), proMetaByKey, proItemIDToKey)
				: [];
		const proUsersResponses: PROUsersResponses = groupPROResponses(allProReponses);

		const proUsersConstructOrders: PROUsersConstructOrders = getUsersConstructOrders(
			proMetaByKey,
			allProReponses
		);

		// read treatment data

		const radiationTreatmentEvents =
			radiationResult.status === 'fulfilled'
				? getRadiationTreatments(stripBom(radiationResult.value))
				: [];

		const systemicTherapyTreatmentEvents =
			systemicTherapyResult.status === 'fulfilled'
				? getSystemicTherapyTreatments(stripBom(systemicTherapyResult.value))
				: [];

		const surgeryEvents =
			surgeryResult.status === 'fulfilled' ? getSurgeries(stripBom(surgeryResult.value)) : [];

		const oralTreatmentEvents =
			oralResult.status === 'fulfilled' ? getOralTreatments(stripBom(oralResult.value)) : [];

		const treatmentEvents = ([] as TreatmentEvent[]).concat(
			radiationTreatmentEvents,
			systemicTherapyTreatmentEvents,
			surgeryEvents,
			oralTreatmentEvents
		);

		const treatmentEventsByUser = d3.group(treatmentEvents, (d) => d.userID);

		return {
			proMetaByKey,
			proUsersResponses,
			proUsersConstructOrders,
			treatmentEventsByUser
		};
	});
}
