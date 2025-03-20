import type { Settings } from '../shared/api.js';

import { dialog, OpenDialogOptions } from 'electron';

import * as fs from 'node:fs/promises';

export function selectFilePaths(allowMultiple: boolean): Promise<string[]> {
	const properties: OpenDialogOptions['properties'] = allowMultiple
		? ['openFile', 'multiSelections']
		: ['openFile'];
	return dialog
		.showOpenDialog({
			filters: [{ name: 'CSV', extensions: ['csv'] }],
			properties
		})
		.then((result) => {
			if (result.canceled || result.filePaths.length == 0) {
				return Promise.reject('canceled');
			}
			return result.filePaths;
		});
}

export function readSettings(path: string): Promise<Settings> {
	return fs
		.readFile(path, 'utf8')
		.then((data) => JSON.parse(data))
		.catch(() => ({ proMetaPath: '', proDataPath: '', treatmentPaths: [] }));
}

export function writeSettings(path: string, settings: Settings): Promise<Settings> {
	try {
		const data = JSON.stringify(settings, null, 2);
		return fs.writeFile(path, data).then(() => settings);
	} catch (err) {
		return Promise.reject(err);
	}
}
