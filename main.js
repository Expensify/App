const {app, BrowserWindow, shell} = require('electron');
const serve = require('electron-serve');
const contextMenu = require('electron-context-menu');

/**
 * Electron main process that handles wrapping the web application.
 *
 * @see: https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

// TODO: Turn this off, use web-security after alpha launch, currently we recieve a CORS issue preventing
// the electron app from making any API requests.
app.commandLine.appendSwitch('disable-web-security');

const mainWindow = (async () => {
    const loadURL = serve({directory: 'dist'});

    await app.whenReady();

    // Initialize the right click menu
    // See https://github.com/sindresorhus/electron-context-menu
    contextMenu();

    const browserWindow = new BrowserWindow({
        backgroundColor: '#FAFAFA',
        width: 1200,
        height: 900,
        webPreferences: {
            nodeIntegration: true,
        },
    });

    await loadURL(browserWindow);

    // When the user clicks a link that has target="_blank" (which is all external links)
    // open the default browser instead of a new electron window
    browserWindow.webContents.on('new-window', (e, url) => {
        // make sure local urls stay in electron perimeter
        if (url.substr(0, 'file://'.length) === 'file://') {
            return;
        }

        // and open every other protocol in the browser
        e.preventDefault();
        shell.openExternal(url);
    });
});

mainWindow();
