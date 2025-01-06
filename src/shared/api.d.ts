export interface ElectronAPI {
	versions: {
		node: () => string;
		chrome: () => string;
		electron: () => string;
	};
}
