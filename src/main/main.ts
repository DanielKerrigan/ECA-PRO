import type { Settings } from '../shared/api.js';
import type { IpcMainInvokeEvent } from 'electron';
import log from 'electron-log';

import { app, BrowserWindow, ipcMain, Menu } from 'electron';

import * as path from 'node:path';
import { readSettings, selectFilePath, writeSettings } from './settings.js';
import { getData } from './data.js';
import { getMenu } from './menu.js';

import started from 'electron-squirrel-startup';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;

log.info('Running main');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
	log.info('Handling shortcut. Quitting.');
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
	log.info('Creating window');

	const preloadPath = path.join(__dirname, 'preload.cjs');
	const win = new BrowserWindow({
		webPreferences: {
			preload: preloadPath
		},
		icon: path.join(__dirname, 'assets/icons/app-icon-512.png')
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
	log.info('App ready');

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

app.on('web-contents-created', (event, contents) => {
	// https://www.electronjs.org/docs/latest/tutorial/security#13-disable-or-limit-navigation
	contents.on('will-navigate', (event, navigationUrl) => {
		log.warn('Preventing navigation');
		event.preventDefault();
	});

	// https://www.electronjs.org/docs/latest/tutorial/security#14-disable-or-limit-creation-of-new-windows
	contents.setWindowOpenHandler(({ url }) => {
		log.warn('Denying window open');
		return { action: 'deny' };
	});
});
