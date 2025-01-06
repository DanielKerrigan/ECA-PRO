const { app, BrowserWindow } = require('electron');
const path = require('path');

const createWindow = () => {
	const preloadPath = path.join(__dirname, '../preload/index.cjs');
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			preload: preloadPath
		}
	});

	// In development, load from Vite dev server
	if (process.env.NODE_ENV === 'development') {
		win.loadURL('http://localhost:5173');
	} else {
		const htmlPath = path.join(__dirname, '..', 'renderer', 'index.html');
		win.loadFile(htmlPath);
	}
};

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
