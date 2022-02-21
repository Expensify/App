const {
    app,
    BrowserWindow,
    Menu,
    MenuItem,
    shell,
    ipcMain,
} = require('electron');
const _ = require('underscore');
const serve = require('electron-serve');
const contextMenu = require('electron-context-menu');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
const ELECTRON_EVENTS = require('./ELECTRON_EVENTS');
const checkForUpdates = require('../src/libs/checkForUpdates');
const CONFIG = require('../src/CONFIG').default;

const port = process.env.PORT || 8080;

console.debug('CONFIG: ', CONFIG);

/**
 * Electron main process that handles wrapping the web application.
 *
 * @see: https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

// This is necessary for NetInfo to work correctly as it does not handle the NetworkInformation API events correctly
// See: https://github.com/electron/electron/issues/22597
app.commandLine.appendSwitch('enable-network-information-downlink-max');

// Initialize the right click menu
// See https://github.com/sindresorhus/electron-context-menu
contextMenu();

// Send all autoUpdater logs to a log file: ~/Library/Logs/new.expensify/main.log
// See https://www.npmjs.com/package/electron-log
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Send all Console logs to a log file: ~/Library/Logs/new.expensify/main.log
// See https://www.npmjs.com/package/electron-log
_.assign(console, log.functions);

// setup Hot reload
if (__DEV__) {
    try {
        require('electron-reloader')(module, {
            watchRenderer: false,
            ignore: [/^(desktop)/],
        });
        // eslint-disable-next-line no-empty
    } catch {}
}

// This sets up the command line arguments used to manage the update. When
// the --expected-update-version flag is set, the app will open pre-hidden
// until it detects that it has been upgraded to the correct version.

const EXPECTED_UPDATE_VERSION_FLAG = '--expected-update-version';

let expectedUpdateVersion;
for (let i = 0; i < process.argv.length; i++) {
    const arg = process.argv[i];
    if (arg.startsWith(`${EXPECTED_UPDATE_VERSION_FLAG}=`)) {
        expectedUpdateVersion = arg.substr((`${EXPECTED_UPDATE_VERSION_FLAG}=`).length);
    }
}

// Add the listeners and variables required to ensure that auto-updating
// happens correctly.
let hasUpdate = false;
let downloadedVersion;

const quitAndInstallWithUpdate = () => {
    if (!downloadedVersion) {
        return;
    }
    hasUpdate = true;
    autoUpdater.quitAndInstall();
};

/**
 * Trigger event to show keyboard shortcuts
 * @param {BrowserWindow} browserWindow
 */
const showKeyboardShortcutsModal = (browserWindow) => {
    if (!browserWindow.isVisible()) {
        return;
    }
    browserWindow.webContents.send(ELECTRON_EVENTS.SHOW_KEYBOARD_SHORTCUTS_MODAL);
};

// Defines the system-level menu item for manually triggering an update after
const updateAppMenuItem = new MenuItem({
    label: 'Update New Expensify',
    enabled: false,
    click: quitAndInstallWithUpdate,
});

// Defines the system-level menu item for opening keyboard shortcuts modal
const keyboardShortcutsMenu = new MenuItem({
    label: 'View Keyboard Shortcuts',
    accelerator: 'CmdOrCtrl+I',
});

// Actual auto-update listeners
const electronUpdater = browserWindow => ({
    init: () => {
        autoUpdater.on(ELECTRON_EVENTS.UPDATE_DOWNLOADED, (info) => {
            downloadedVersion = info.version;
            updateAppMenuItem.enabled = true;
            if (browserWindow.isVisible()) {
                browserWindow.webContents.send(ELECTRON_EVENTS.UPDATE_DOWNLOADED, info.version);
            } else {
                quitAndInstallWithUpdate();
            }
        });

        ipcMain.on(ELECTRON_EVENTS.START_UPDATE, quitAndInstallWithUpdate);
        autoUpdater.checkForUpdates();
    },
    update: () => {
        autoUpdater.checkForUpdates();
    },
});

const mainWindow = (() => {
    const loadURL = __DEV__
        ? win => win.loadURL(`http://localhost:${port}`)
        : serve({directory: `${__dirname}/www`});

    // Prod and staging set the icon in the electron-builder config, so only update it here for dev
    if (__DEV__) {
        app.dock.setIcon(`${__dirname}/../icon-dev.png`);
        app.setName('New Expensify');
    }

    return app.whenReady()
        .then(() => {
            const browserWindow = new BrowserWindow({
                backgroundColor: '#FAFAFA',
                width: 1200,
                height: 900,
                webPreferences: {
                    preload: `${__dirname}/contextBridge.js`,
                    contextIsolation: true,
                },
                titleBarStyle: 'hidden',
            });

            /*
             * The default origin of our Electron app is app://- instead of https://new.expensify.com or https://staging.new.expensify.com
             * This causes CORS errors because the referer and origin headers are wrong and the API responds with an Access-Control-Allow-Origin that doesn't match app://-
             * The same issue happens when using the web proxy to communicate with the staging or production API on dev.
             *
             * To fix this, we'll:
             *
             *   1. Modify headers on any outgoing requests to match the origin of our corresponding web environment (not necessary in case of web proxy, because it already does that)
             *   2. Modify the Access-Control-Allow-Origin header of the response to match the "real" origin of our Electron app.
             */
            const validDestinationFilters = {urls: ['https://*.expensify.com/*']};
            if (!__DEV__) {
                // Modify the origin and referer for requests sent to our API
                browserWindow.webContents.session.webRequest.onBeforeSendHeaders(validDestinationFilters, (details, callback) => {
                    // eslint-disable-next-line no-param-reassign
                    details.requestHeaders.origin = CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH;
                    // eslint-disable-next-line no-param-reassign
                    details.requestHeaders.referer = CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH;
                    callback({requestHeaders: details.requestHeaders});
                });

                // Modify access-control-allow-origin header for the response
                browserWindow.webContents.session.webRequest.onHeadersReceived(validDestinationFilters, (details, callback) => {
                    // eslint-disable-next-line no-param-reassign
                    details.responseHeaders['access-control-allow-origin'] = ['app://-'];
                    callback({responseHeaders: details.responseHeaders});
                });
            }

            if (__DEV__) {
                if (process.env.USE_WEB_PROXY !== 'false') {
                    browserWindow.webContents.session.webRequest.onHeadersReceived(validDestinationFilters, (details, callback) => {
                        // eslint-disable-next-line no-param-reassign
                        details.responseHeaders['access-control-allow-origin'] = ['http://localhost:8080'];
                        callback({responseHeaders: details.responseHeaders});
                    });
                }
            }

            // Prod and staging overwrite the app name in the electron-builder config, so only update it here for dev
            if (__DEV__) {
                browserWindow.setTitle('New Expensify');
            }

            keyboardShortcutsMenu.click = () => {
                showKeyboardShortcutsModal(browserWindow);
            };

            // List the Expensify Chat instance under the Window menu, even when it's hidden
            const systemMenu = Menu.getApplicationMenu();
            systemMenu.insert(4, new MenuItem({
                label: 'History',
                submenu: [{
                    role: 'back',
                    label: 'Back',
                    accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Shift+[',
                    click: () => { browserWindow.webContents.goBack(); },
                },
                {
                    role: 'forward',
                    label: 'Forward',
                    accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Shift+]',
                    click: () => { browserWindow.webContents.goForward(); },
                }],
            }));

            const appMenu = _.find(systemMenu.items, item => item.role === 'appmenu');
            appMenu.submenu.insert(1, updateAppMenuItem);
            appMenu.submenu.insert(2, keyboardShortcutsMenu);


            // On mac, pressing cmd++ actually sends a cmd+=. cmd++ is generally the zoom in shortcut, but this is
            // not properly listened for by electron. Adding in an invisible cmd+= listener fixes this.
            const viewWindow = _.find(systemMenu.items, item => item.role === 'viewmenu');
            viewWindow.submenu.append(new MenuItem({
                role: 'zoomin',
                accelerator: 'CommandOrControl+=',
                visible: false,
            }));
            const windowMenu = _.find(systemMenu.items, item => item.role === 'windowmenu');
            windowMenu.submenu.append(new MenuItem({type: 'separator'}));
            windowMenu.submenu.append(new MenuItem({
                label: 'New Expensify',
                accelerator: 'CmdOrCtrl+1',
                click: () => browserWindow.show(),
            }));
            Menu.setApplicationMenu(systemMenu);

            // When the user clicks a link that has target="_blank" (which is all external links)
            // open the default browser instead of a new electron window
            browserWindow.webContents.setWindowOpenHandler(({url}) => {
                const denial = {action: 'deny'};

                // Make sure local urls stay in electron perimeter
                if (url.substr(0, 'file://'.length).toLowerCase() === 'file://') {
                    return denial;
                }

                // Open every other protocol in the default browser, not Electron
                shell.openExternal(url);
                return denial;
            });

            // Flag to determine is user is trying to quit the whole application altogether
            let quitting = false;

            // Closing the chat window should just hide it (vs. fully quitting the application)
            browserWindow.on('close', (evt) => {
                if (quitting || hasUpdate) {
                    return;
                }

                evt.preventDefault();
                browserWindow.hide();
            });

            // Initiating a browser-back or browser-forward with mouse buttons should navigate history.
            browserWindow.on('app-command', (e, cmd) => {
                if (cmd === 'browser-backward') {
                    browserWindow.webContents.goBack();
                }
                if (cmd === 'browser-forward') {
                    browserWindow.webContents.goForward();
                }
            });

            app.on('before-quit', () => quitting = true);
            app.on('activate', () => {
                if (expectedUpdateVersion && app.getVersion() !== expectedUpdateVersion) {
                    return;
                }

                browserWindow.show();
            });

            // Hide the app if we expected to upgrade to a new version but never did.
            if (expectedUpdateVersion && app.getVersion() !== expectedUpdateVersion) {
                browserWindow.hide();
                app.hide();
            }

            ipcMain.on(ELECTRON_EVENTS.REQUEST_VISIBILITY, (event) => {
                // This is how synchronous messages work in Electron
                // eslint-disable-next-line no-param-reassign
                event.returnValue = browserWindow && !browserWindow.isDestroyed() && browserWindow.isFocused();
            });

            // This allows the renderer process to bring the app
            // back into focus if it's minimized or hidden.
            ipcMain.on(ELECTRON_EVENTS.REQUEST_FOCUS_APP, () => {
                browserWindow.show();
            });

            // Listen to badge updater event emitted by the render process
            // and update the app badge count (MacOS only)
            ipcMain.on(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, (event, totalCount) => {
                if (totalCount === -1) {
                    // The electron docs say you should be able to update this and pass no parameters to set the badge
                    // to a single red dot, but in practice it resulted in an error "TypeError: Insufficient number of
                    // arguments." - Thus, setting to 1 instead.
                    // See: https://www.electronjs.org/docs/api/app#appsetbadgecountcount-linux-macos
                    app.setBadgeCount(1);
                } else {
                    app.setBadgeCount(totalCount);
                }
            });

            return browserWindow;
        })

        // After initializing and configuring the browser window, load the compiled JavaScript
        .then((browserWindow) => {
            loadURL(browserWindow);
            return browserWindow;
        })

        // Start checking for JS updates
        .then((browserWindow) => {
            if (__DEV__) {
                return;
            }

            checkForUpdates(electronUpdater(browserWindow));
        });
});

mainWindow().then(window => window);
