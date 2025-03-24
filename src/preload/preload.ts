// import type { ElectronAPI, Settings } from '../shared/api' with { 'resolution-mode': 'require' };
// const { contextBridge, ipcRenderer } = require('electron');
import type { ElectronAPI, Settings } from '../shared/api.ts';
import { contextBridge, ipcRenderer } from 'electron';

const api: ElectronAPI = {
	getSettings: () => ipcRenderer.invoke('get-settings'),
	updateSettings: (newSettings: Settings) => ipcRenderer.invoke('update-settings', newSettings),
	selectFilePath: () => ipcRenderer.invoke('select-file-path'),
	onSettingsMenuClicked: (callback: () => void) =>
		ipcRenderer.on('open-settings', () => callback()),
	getData: (settings: Settings) => ipcRenderer.invoke('get-data', settings)
};

contextBridge.exposeInMainWorld('api', api);
