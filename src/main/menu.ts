import { Menu, MenuItemConstructorOptions } from 'electron';
import type { BrowserWindow } from 'electron';

function getSettings(win: BrowserWindow): MenuItemConstructorOptions {
	return {
		click: () => win.webContents.send('open-settings'),
		label: 'Settings'
	};
}

function getAppMenu(appName: string, win: BrowserWindow): MenuItemConstructorOptions {
	return {
		label: appName,
		submenu: [
			getSettings(win),
			{ type: 'separator' },
			{ role: 'hide' },
			{ role: 'hideOthers' },
			{ role: 'unhide' },
			{ type: 'separator' },
			{ role: 'quit' }
		]
	};
}

function getFileMenu(isMac: boolean, win: BrowserWindow): MenuItemConstructorOptions {
	const submenu: MenuItemConstructorOptions[] = isMac
		? [{ role: 'close' }]
		: [getSettings(win), { role: 'quit' }];

	return {
		label: 'File',
		submenu
	};
}

function getEditMenu(isMac: boolean): MenuItemConstructorOptions {
	const osSpecific: MenuItemConstructorOptions[] = isMac
		? [
				{ role: 'pasteAndMatchStyle' },
				{ role: 'delete' },
				{ role: 'selectAll' },
				{ type: 'separator' },
				{
					label: 'Speech',
					submenu: [{ role: 'startSpeaking' }, { role: 'stopSpeaking' }]
				}
			]
		: [{ role: 'delete' }, { type: 'separator' }, { role: 'selectAll' }];

	const submenu: MenuItemConstructorOptions[] = [
		{ role: 'undo' },
		{ role: 'redo' },
		{ type: 'separator' },
		{ role: 'cut' },
		{ role: 'copy' },
		{ role: 'paste' },
		...osSpecific
	];

	return {
		label: 'Edit',
		submenu: submenu
	};
}

function getViewMenu(): MenuItemConstructorOptions {
	return {
		label: 'View',
		submenu: [
			{ role: 'reload' },
			{ role: 'forceReload' },
			{ role: 'toggleDevTools' },
			{ type: 'separator' },
			{ role: 'resetZoom' },
			{ role: 'zoomIn' },
			{ role: 'zoomOut' },
			{ type: 'separator' },
			{ role: 'togglefullscreen' }
		]
	};
}

function getWindowMenu(isMac: boolean): MenuItemConstructorOptions {
	const osSpecific: MenuItemConstructorOptions[] = isMac
		? [{ type: 'separator' }, { role: 'front' }, { type: 'separator' }, { role: 'window' }]
		: [{ role: 'close' }];

	const submenu: MenuItemConstructorOptions[] = [
		{ role: 'minimize' },
		{ role: 'zoom' },
		...osSpecific
	];

	return {
		label: 'Window',
		submenu
	};
}

export function getMenu(appName: string, isMac: boolean, win: BrowserWindow): Menu {
	const template: MenuItemConstructorOptions[] = [];

	if (isMac) {
		template.push(getAppMenu(appName, win));
	}

	template.push(getFileMenu(isMac, win), getEditMenu(isMac), getViewMenu(), getWindowMenu(isMac));

	return Menu.buildFromTemplate(template);
}
