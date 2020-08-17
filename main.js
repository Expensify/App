const {app, BrowserWindow} = require('electron');
const serve = require('electron-serve');

const mainWindow = (async () => {
    const loadURL = serve({directory: 'dist'});

    await app.whenReady();

    const browserWindow = new BrowserWindow({
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    await loadURL(browserWindow);
});

mainWindow();
