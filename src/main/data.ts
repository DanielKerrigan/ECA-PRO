import type {
	Data,
	PROUsersResponses,
	PROResponse,
	PROUsersConstructOrders,
	PROItem,
	Settings,
	RadiationTreatment
} from '../shared/api.js';

import * as fs from 'node:fs/promises';
import { getPROItems, mergePROItems, getPROItemIDToKey } from './pro/proMeta.js';
import { getPROResponses, groupPROResponses } from './pro/proResponses.js';
import { getUsersConstructOrders } from './pro/proSymptomSorting.js';
import { getRadiationTreatments } from './symptoms/radiation.js';
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
		const [proMetaValue, proDataValue, radiationValue, systemicTherapyPath, oralValue] = values;

		const proItems: PROItem[] =
			proMetaValue.status === 'fulfilled' ? getPROItems(stripBom(proMetaValue.value)) : [];
		const proMetaByKey = mergePROItems(proItems);
		const proItemIDToKey = getPROItemIDToKey(proItems);

		const allProReponses: PROResponse[] =
			proDataValue.status === 'fulfilled'
				? getPROResponses(stripBom(proDataValue.value), proMetaByKey, proItemIDToKey)
				: [];
		const proUsersResponses: PROUsersResponses = groupPROResponses(allProReponses);

		const proUsersConstructOrders: PROUsersConstructOrders = getUsersConstructOrders(
			proMetaByKey,
			allProReponses
		);

		const radiationTreatmentByUser =
			radiationValue.status === 'fulfilled'
				? getRadiationTreatments(stripBom(radiationValue.value))
				: new Map<number, RadiationTreatment>();

		return {
			proMetaByKey,
			proUsersResponses,
			proUsersConstructOrders,
			radiationTreatmentByUser
		};
	});
}
