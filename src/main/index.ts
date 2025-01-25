import type { Data, PROUsersResponses, PROMeta, PROResponse, Settings } from '../shared/api.js';
import type { IpcMainInvokeEvent } from 'electron';

import { app, BrowserWindow, ipcMain, Menu, dialog } from 'electron';

import * as d3 from 'd3';
import * as path from 'node:path';
import * as fs from 'node:fs/promises';
import * as fsSync from 'node:fs';

const __dirname = import.meta.dirname;

function readSettings(path: string): Settings {
	try {
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

function writeSettings(path: string, settings: Settings): Promise<void> {
	try {
		const data = JSON.stringify(settings, null, 2);
		return fs.writeFile(path, data);
	} catch (err) {
		return Promise.reject(err);
	}
}

function updateSettings(path: string, settings: Settings): Promise<Settings> {
	return writeSettings(path, settings).then(() => {
		return settings;
	});
}

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

function getData(directoryPath: string): Promise<Data> {
	const metaPromise = fs.readFile(path.join(directoryPath, 'META.csv'), 'utf8');
	const dataPromise = fs.readFile(path.join(directoryPath, 'DATA.csv'), 'utf8');

	return Promise.all([metaPromise, dataPromise]).then(([metaContents, dataContents]) => {
		const metaRows = d3
			.csvParse(metaContents, (d) => {
				const responseItemStrings = d.ResponseItemValues.split('|').map((s) => s.trim());
				const responseItemValues = d3.range(responseItemStrings.length);

				return {
					itemID: +d.ItemID,
					item: d.Item,
					constructName: d.ConstructName,
					responseItemType: d.ResponseItemType,
					responseItemStrings,
					responseItemValues,
					bankName: d.BankName,
					categoryName: d.CategoryName
				};
			})
			.filter((d) => d.item !== '');

		const proMeta: PROMeta = d3.group(
			metaRows,
			(d) => d.categoryName,
			(d) => d.constructName
		);

		const dateParse = d3.timeParse('%Y-%m-%d %H:%M:%S');

		const dataRows = d3
			.csvParse(dataContents, (d) => {
				return {
					userID: +d.UserID,
					dateTime: dateParse(d.DateTime),
					itemID: +d.ItemID,
					responseValue: +d.ResponseValue,
					responseText: d.ResponseText
				};
			})
			.filter((d): d is PROResponse => d.dateTime !== null);

		const proUsersResponses: PROUsersResponses = d3.rollup(
			dataRows,
			(g) => g.sort((a, b) => d3.ascending(a.dateTime, b.dateTime)),
			(d) => d.userID,
			(d) => d.itemID
		);

		return {
			proMeta,
			proUsersResponses
		};
	});
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

	const menu = Menu.buildFromTemplate([
		{
			label: app.name,
			submenu: [
				{
					click: () => win.webContents.send('open-settings'),
					label: 'Settings'
				}
			]
		}
	]);

	Menu.setApplicationMenu(menu);

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
