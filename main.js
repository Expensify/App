const {app, BrowserWindow} = require('electron');
const serve = require('electron-serve');

// TODO: Turn this off, use CORS after alpha launch
app.commandLine.appendSwitch('disable-web-security');

const mainWindow = (async () => {
    const loadURL = serve({directory: 'dist'});

    await app.whenReady();

    const browserWindow = new BrowserWindow({
        // TODO: Grab from StyleSheet.js
        backgroundColor: '#FAFAFA',
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    await loadURL(browserWindow);
});

mainWindow();
