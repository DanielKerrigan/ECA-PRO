import type { Settings } from '../shared/api.js';
import type { IpcMainInvokeEvent } from 'electron';

import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';

import * as path from 'node:path';
import { readSettings, updateSettings } from './settings.js';
import { getData } from './data.js';
import { getMenu } from './menu.js';

const __dirname = import.meta.dirname;

function selectDirectory(): Promise<string> {
	return dialog
		.showOpenDialog({
			properties: ['openDirectory']
		})
		.then(
			(result) => {
				if (result.canceled || result.filePaths.length == 0) {
					return Promise.reject('canceled');
				}
				return result.filePaths[0];
			},
			(reason) => Promise.reject(reason)
		);
}

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

ipcMain.handle('get-settings', () => readSettings(settingsPath));
ipcMain.handle('select-directory', () => selectDirectory());
ipcMain.handle('update-settings', (_event: IpcMainInvokeEvent, newSettings: Settings) =>
	updateSettings(settingsPath, newSettings)
);
ipcMain.handle('get-data', (_event: IpcMainInvokeEvent, path: string) => getData(path));

function createWindow() {
	const preloadPath = path.join(__dirname, '../preload/index.cjs');
	const win = new BrowserWindow({
		webPreferences: {
			preload: preloadPath
		}
	});
	win.maximize();

	// menu

	Menu.setApplicationMenu(getMenu(app.name, process.platform === 'darwin', win));

	// In development, load from Vite dev server
	if (process.env.NODE_ENV === 'development') {
		win.loadURL('http://localhost:5173');
		win.webContents.openDevTools();
	} else {
		const htmlPath = path.join(__dirname, '..', 'renderer', 'index.html');
		win.loadFile(htmlPath);
	}
}

app.whenReady().then(() => {
	createWindow();

	app.on('activate', () => {
		if (BrowserWindow.getAllWindows().length === 0) {
			createWindow();
		}
	});
});

app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
