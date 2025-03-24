import type { Settings } from '../shared/api.js';
import type { IpcMainInvokeEvent } from 'electron';

import { app, BrowserWindow, ipcMain, Menu } from 'electron';

import * as path from 'node:path';
import { readSettings, selectFilePath, writeSettings } from './settings.js';
import { getData } from './data.js';
import { getMenu } from './menu.js';

import started from 'electron-squirrel-startup';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	app.quit();
}

const __dirname = import.meta.dirname;

const settingsPath = path.join(app.getPath('userData'), 'settings.json');

ipcMain.handle('get-settings', () => readSettings(settingsPath));
ipcMain.handle('select-file-path', (_event: IpcMainInvokeEvent) => selectFilePath());
ipcMain.handle('update-settings', (_event: IpcMainInvokeEvent, newSettings: Settings) =>
	writeSettings(settingsPath, newSettings)
);
ipcMain.handle('get-data', (_event: IpcMainInvokeEvent, settings: Settings) => getData(settings));

function createWindow() {
	const preloadPath = path.join(__dirname, 'preload.cjs');
	const win = new BrowserWindow({
		webPreferences: {
			preload: preloadPath
		}
	});
	win.maximize();

	// menu

	Menu.setApplicationMenu(getMenu(app.name, process.platform === 'darwin', win));

	// In development, load from Vite dev server
	if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
		win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
		win.webContents.openDevTools();
	} else {
		const htmlPath = path.join(__dirname, '..', 'renderer', MAIN_WINDOW_VITE_NAME, 'index.html');
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
