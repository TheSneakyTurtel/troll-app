import { app, BrowserWindow } from "electron";
import * as path from "path";

function createWindow() {
	const mainWindow = new BrowserWindow({
		webPreferences: {
			preload: path.join(__dirname, "preload.js"),
		},
		minWidth: 800,
		width: 800,
		maxWidth: 800,
		minHeight: 600,
		height: 600,
		maxHeight: 600,
		closable: false,
		minimizable: false,
		alwaysOnTop: true,
	});

	mainWindow.loadFile(path.join(__dirname, "../../index.html"));
	mainWindow.webContents.openDevTools();
}

app.on("ready", () => {
	createWindow();

	app.on("activate", () => !BrowserWindow.getAllWindows().length && createWindow());
});

app.on("window-all-closed", () => process.platform !== "darwin" && app.quit());
