import type {
	Data,
	PROUsersResponses,
	PROResponse,
	PROUsersConstructOrders,
	PROItem,
	Settings,
	TreatmentEvent,
	OralTreatmentEvent
} from '../shared/api.js';

import * as fs from 'node:fs/promises';
import { getPROItems, mergePROItems, getPROItemIDToKey } from './pro/proMeta.js';
import { getPROResponses, groupPROResponses } from './pro/proResponses.js';
import { getUsersConstructOrders } from './pro/proSymptomSorting.js';
import { getRadiationTreatments } from './symptoms/radiation.js';
import { getOralTreatments } from './symptoms/oral.js';
import { getSystemicTherapyTreatments } from './symptoms/systemicTherapy.js';
import { stripBom } from './utils.js';

export function getData(settings: Settings): Promise<Data> {
	const promises = [
		fs.readFile(settings.proMetaPath, 'utf8'),
		fs.readFile(settings.proDataPath, 'utf8'),
		fs.readFile(settings.radiationPath, 'utf8'),
		fs.readFile(settings.systemicTherapyPath, 'utf8'),
		fs.readFile(settings.oralPath, 'utf8')
	];

	return Promise.allSettled(promises).then((values) => {
		const [proMetaResult, proDataResult, radiationResult, systemicTherapyResult, oralResult] =
			values;

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

		const radiationTreatmentByUser =
			radiationResult.status === 'fulfilled'
				? getRadiationTreatments(stripBom(radiationResult.value))
				: new Map<number, TreatmentEvent[]>();

		const systemicTherapyTreatmentByUser =
			systemicTherapyResult.status === 'fulfilled'
				? getSystemicTherapyTreatments(stripBom(systemicTherapyResult.value))
				: new Map<number, TreatmentEvent[]>();

		const oralTreatmentByUser =
			oralResult.status === 'fulfilled'
				? getOralTreatments(stripBom(oralResult.value))
				: new Map<number, OralTreatmentEvent[]>();

		return {
			proMetaByKey,
			proUsersResponses,
			proUsersConstructOrders,
			radiationTreatmentByUser,
			systemicTherapyTreatmentByUser,
			oralTreatmentByUser
		};
	});
}
