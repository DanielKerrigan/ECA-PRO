import type {
	Data,
	PROUsersResponses,
	PROResponse,
	PROUsersConstructOrders,
	PROItem
} from '../shared/api.js';

import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import * as d3 from 'd3';
import { getPROItems, groupPROItems } from './proMeta.js';
import { getPROResponses, groupPROResponses } from './proResponses.js';
import { getUsersConstructOrders } from './proSymptomSorting.js';

export function getData(directoryPath: string): Promise<Data> {
	const metaPromise = fs.readFile(path.join(directoryPath, 'META.csv'), 'utf8');
	const dataPromise = fs.readFile(path.join(directoryPath, 'DATA.csv'), 'utf8');

	return Promise.all([metaPromise, dataPromise]).then(([metaContents, dataContents]) => {
		const dateParse = d3.timeParse('%Y-%m-%d %H:%M:%S');

		const proItems: PROItem[] = getPROItems(metaContents);
		const proMetaByID = groupPROItems(proItems);

		const allProReponses: PROResponse[] = getPROResponses(dataContents, proMetaByID, dateParse);
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
	});
}
