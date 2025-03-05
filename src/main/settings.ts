import type { Settings } from '../shared/api.js';

import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';

export function readSettings(path: string): Settings {
	try {
		// TODO: switch to async
		const data: string = fsSync.readFileSync(path, 'utf8');
		const settings: Settings = JSON.parse(data);
		return settings;
	} catch (err) {
		console.error('Error reading settings', err);
		return {
			directory: ''
		};
	}
}

export function writeSettings(path: string, settings: Settings): Promise<void> {
	try {
		const data = JSON.stringify(settings, null, 2);
		return fs.writeFile(path, data);
	} catch (err) {
		return Promise.reject(err);
	}
}

export function updateSettings(path: string, settings: Settings): Promise<Settings> {
	return writeSettings(path, settings).then(() => {
		return settings;
	});
}
