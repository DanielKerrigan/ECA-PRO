import type {
	Data,
	PROUsersResponses,
	PROResponse,
	PROUsersConstructOrders,
	PROItem,
	Settings
} from '../shared/api.js';

import * as fs from 'node:fs/promises';
import { getPROItems, groupPROItems } from './pro/proMeta.js';
import { getPROResponses, groupPROResponses } from './pro/proResponses.js';
import { getUsersConstructOrders } from './pro/proSymptomSorting.js';

export function getData(settings: Settings): Promise<Data> {
	const metaPromise = fs.readFile(settings.proMetaPath, 'utf8');
	const dataPromise = fs.readFile(settings.proDataPath, 'utf8');
	const treatmentPromises = settings.treatmentPaths.map((path) => fs.readFile(path, 'utf8'));

	return Promise.all([metaPromise, dataPromise, ...treatmentPromises]).then(
		([metaContents, dataContents, ...treatmentContents]) => {
			const proItems: PROItem[] = getPROItems(metaContents);
			const proMetaByID = groupPROItems(proItems);

			const allProReponses: PROResponse[] = getPROResponses(dataContents, proMetaByID);
			const proUsersResponses: PROUsersResponses = groupPROResponses(allProReponses);

			const proUsersConstructOrders: PROUsersConstructOrders = getUsersConstructOrders(
				proMetaByID,
				allProReponses
			);

			return {
				proMetaByID,
				proUsersResponses,
				proUsersConstructOrders
			};
		}
	);
}
