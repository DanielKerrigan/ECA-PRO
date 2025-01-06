import type { ElectronAPI } from '../shared/api';
const { contextBridge } = require('electron');

const api: ElectronAPI = {
	versions: {
		node: () => process.versions.node,
		chrome: () => process.versions.chrome,
		electron: () => process.versions.electron
	}
};

contextBridge.exposeInMainWorld('api', api);
