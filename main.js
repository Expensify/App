const {app, BrowserWindow, shell} = require('electron');
const serve = require('electron-serve');
const contextMenu = require('electron-context-menu');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');

/**
 * Electron main process that handles wrapping the web application.
 *
 * @see: https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

// TODO: Turn this off, use web-security after alpha launch, currently we receive a CORS issue preventing
// the electron app from making any API requests.
app.commandLine.appendSwitch('disable-web-security');

// TODO: Remove this before merging, just used for testing
autoUpdater.logger = log;
Object.assign(console, log.functions);
autoUpdater.logger.transports.file.level = 'info';

log.info('App starting...');

autoUpdater.on('checking-for-update', () => {
    log.info('Checking for update...');
});

autoUpdater.on('update-available', (info) => {
    log.info(`Update available ${JSON.stringify(info)}`);
});

autoUpdater.on('update-not-available', (info) => {
    log.info(`Update not available ${JSON.stringify(info)}`);
});

autoUpdater.on('error', (err) => {
    log.info(`Error in auto-updater. ${err}`);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = `Download speed: ${progressObj.bytesPerSecond}`;
    log_message = `${log_message} - Downloaded ${progressObj.percent}%`;
    log_message = `${log_message} (${progressObj.transferred}/${progressObj.total})`;
    log.info(log_message);
});

autoUpdater.on('update-downloaded', (info) => {
    log.info(`Update downloaded ${JSON.stringify(info)}`);
});

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

    // Check for auto updates
    await autoUpdater.checkForUpdatesAndNotify();
});

mainWindow();
