import type { ElectronAPI, Settings } from '../shared/api';
const { contextBridge, ipcRenderer } = require('electron');

const api: ElectronAPI = {
	getSettings: () => ipcRenderer.invoke('get-settings'),
	updateSettings: (newSettings: Settings) => ipcRenderer.invoke('update-settings', newSettings),
	selectDirectory: () => ipcRenderer.invoke('select-directory'),
	onSettingsMenuClicked: (callback: () => void) =>
		ipcRenderer.on('open-settings', () => callback()),
	getData: (path: string) => ipcRenderer.invoke('get-data', path)
};

contextBridge.exposeInMainWorld('api', api);
