const {app, BrowserWindow} = require('electron');
const serve = require('electron-serve');

/**
 * Electron main process that handles wrapping the web application.
 *
 * @see: https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

// TODO: Turn this off, use web-security after alpha launch, currently we recieve a CORS issue preventing
// the electron app from making any API reuqests.
app.commandLine.appendSwitch('disable-web-security');

const mainWindow = (async () => {
    const loadURL = serve({directory: 'dist'});

    await app.whenReady();

    const browserWindow = new BrowserWindow({
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
