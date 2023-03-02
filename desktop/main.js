const {
    app,
    dialog,
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
const {machineId} = require('node-machine-id');
const ELECTRON_EVENTS = require('./ELECTRON_EVENTS');
const checkForUpdates = require('../src/libs/checkForUpdates');
const CONFIG = require('../src/CONFIG').default;
const CONST = require('../src/CONST');
const Localize = require('../src/libs/Localize');

const port = process.env.PORT || 8080;

app.setName('New Expensify');

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
// Add the Paste and Match Style command to the context menu
contextMenu({
    append: (defaultActions, parameters) => [
        new MenuItem({
            // Only enable the menu item for Editable context which supports paste
            visible: parameters.isEditable && parameters.editFlags.canPaste,
            role: 'pasteAndMatchStyle',
            accelerator: 'CmdOrCtrl+Shift+V',
        }),
    ],
});

// Send all autoUpdater logs to a log file: ~/Library/Logs/new.expensify.desktop/main.log
// See https://www.npmjs.com/package/electron-log
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = 'info';

// Send all Console logs to a log file: ~/Library/Logs/new.expensify.desktop/main.log
// See https://www.npmjs.com/package/electron-log
_.assign(console, log.functions);

// This sets up the command line arguments used to manage the update. When
// the --expected-update-version flag is set, the app will open pre-hidden
// until it detects that it has been upgraded to the correct version.

const EXPECTED_UPDATE_VERSION_FLAG = '--expected-update-version';
const APP_DOMAIN = __DEV__ ? `http://localhost:${port}` : 'app://-';

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

// Note that we have to subscribe to this separately and cannot use Localize.translateLocal,
// because the only way code can be shared between the main and renderer processes at runtime is via the context bridge
// So we track preferredLocale separately via ELECTRON_EVENTS.LOCALE_UPDATED
let preferredLocale = CONST.DEFAULT_LOCALE;

const quitAndInstallWithUpdate = () => {
    if (!downloadedVersion) {
        return;
    }
    hasUpdate = true;
    autoUpdater.quitAndInstall();
};

/**
 * Menu Item callback to triggers an update check
 * @param {MenuItem} menuItem
 * @param {BrowserWindow} browserWindow
 */
const manuallyCheckForUpdates = (menuItem, browserWindow) => {
    // Disable item until the check (and download) is complete
    // eslint: menu item flags like enabled or visible can be dynamically toggled by mutating the object
    // eslint-disable-next-line no-param-reassign
    menuItem.enabled = false;

    autoUpdater.checkForUpdates()
        .catch(error => ({error}))
        .then((result) => {
            const downloadPromise = result && result.downloadPromise;

            if (downloadPromise) {
                dialog.showMessageBox(browserWindow, {
                    type: 'info',
                    message: Localize.translate(preferredLocale, 'checkForUpdatesModal.available.title'),
                    detail: Localize.translate(preferredLocale, 'checkForUpdatesModal.available.message'),
                    buttons: [Localize.translate(preferredLocale, 'checkForUpdatesModal.available.soundsGood')],
                });
            } else if (result && result.error) {
                dialog.showMessageBox(browserWindow, {
                    type: 'error',
                    message: Localize.translate(preferredLocale, 'checkForUpdatesModal.error.title'),
                    detail: Localize.translate(preferredLocale, 'checkForUpdatesModal.error.message'),
                    buttons: [Localize.translate(preferredLocale, 'checkForUpdatesModal.notAvailable.okay')],
                });
            } else {
                dialog.showMessageBox(browserWindow, {
                    type: 'info',
                    message: Localize.translate(preferredLocale, 'checkForUpdatesModal.notAvailable.title'),
                    detail: Localize.translate(preferredLocale, 'checkForUpdatesModal.notAvailable.message'),
                    buttons: [Localize.translate(preferredLocale, 'checkForUpdatesModal.notAvailable.okay')],
                    cancelId: 2,
                });
            }

            // By returning the `downloadPromise` we keep "check for updates" disabled if any updates are being downloaded
            return downloadPromise;
        })
        .finally(() => {
            // eslint-disable-next-line no-param-reassign
            menuItem.enabled = true;
        });
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

// Actual auto-update listeners
const electronUpdater = browserWindow => ({
    init: () => {
        autoUpdater.on(ELECTRON_EVENTS.UPDATE_DOWNLOADED, (info) => {
            const systemMenu = Menu.getApplicationMenu();
            downloadedVersion = info.version;
            systemMenu.getMenuItemById(`updateAppMenuItem-${preferredLocale}`).visible = true;
            systemMenu.getMenuItemById(`checkForUpdateMenuItem-${preferredLocale}`).visible = false;
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

/*
* @param {Menu} systemMenu
*/
const localizeMenuItems = (browserWindow, systemMenu) => {
    // List the Expensify Chat instance under the Window menu, even when it's hidden
    systemMenu.insert(4, new MenuItem({
        id: `historyMenuItem-${preferredLocale}`,
        label: Localize.translate(preferredLocale, 'desktopApplicationMenu.history'),
        submenu: [{
            id: `backMenuItem-${preferredLocale}`,
            label: Localize.translate(preferredLocale, 'historyMenu.back'),
            accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Shift+[',
            click: () => { browserWindow.webContents.goBack(); },
        },
        {
            id: `forwardMenuItem-${preferredLocale}`,
            label: Localize.translate(preferredLocale, 'historyMenu.forward'),
            accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Shift+]',
            click: () => { browserWindow.webContents.goForward(); },
        }],
    }));

    // Defines the system-level menu item to manually apply an update
    // This menu item should become visible after an update is downloaded and ready to be applied
    const updateAppMenuItem = new MenuItem({
        id: `updateAppMenuItem-${preferredLocale}`,
        label: Localize.translate(preferredLocale, 'desktopApplicationMenu.updateExpensify'),
        visible: false,
        click: quitAndInstallWithUpdate,
    });

    // System-level menu item to manually check for App updates
    const checkForUpdateMenuItem = new MenuItem({
        id: `checkForUpdateMenuItem-${preferredLocale}`,
        label: Localize.translate(preferredLocale, 'desktopApplicationMenu.checkForUpdates'),
        visible: true,
        click: manuallyCheckForUpdates,
    });

    // Defines the system-level menu item for opening keyboard shortcuts modal
    const keyboardShortcutsMenuItem = new MenuItem({
        id: `keyboardShortcutsMenuItem-${preferredLocale}`,
        label: Localize.translate(preferredLocale, 'initialSettingsPage.aboutPage.viewKeyboardShortcuts'),
        accelerator: 'CmdOrCtrl+I',
        click: () => {
            showKeyboardShortcutsModal(browserWindow);
        },
    });

    const appMenu = _.find(systemMenu.items, item => item.role === 'appmenu');
    appMenu.submenu.insert(1, updateAppMenuItem);
    appMenu.submenu.insert(2, checkForUpdateMenuItem);
    appMenu.submenu.insert(3, keyboardShortcutsMenuItem);
};

const mainWindow = (() => {
    let deeplinkUrl;
    let browserWindow;

    const loadURL = __DEV__
        ? win => win.loadURL(`http://localhost:${port}`)
        : serve({directory: `${__dirname}/www`});

    // Prod and staging set the icon in the electron-builder config, so only update it here for dev
    if (__DEV__) {
        console.debug('CONFIG: ', CONFIG);
        app.dock.setIcon(`${__dirname}/../icon-dev.png`);
        app.setName('New Expensify');
    }

    app.on('will-finish-launching', () => {
        app.on('open-url', (event, url) => {
            event.preventDefault();
            const urlObject = new URL(url);
            deeplinkUrl = `${APP_DOMAIN}${urlObject.pathname}${urlObject.search}${urlObject.hash}`;

            if (browserWindow) {
                browserWindow.loadURL(deeplinkUrl);
                browserWindow.show();
            }
        });
    });

    /*
    * Starting from Electron 20, it shall be required to set sandbox option to false explicitly.
    * Running a preload script contextBridge.js require access to nodeJS modules from the javascript code.
    * This was not a concern earlier as sandbox used to be false by default for Electron <= 20.
    * Refer https://www.electronjs.org/docs/latest/tutorial/sandbox#disabling-the-sandbox-for-a-single-process
    * */
    return app.whenReady()
        .then(() => {
            /**
             * We only want to register the scheme this way when in dev, since
             * when the app is bundled electron-builder will take care of it.
             */
            if (__DEV__) {
                app.setAsDefaultProtocolClient('new-expensify');
            }

            browserWindow = new BrowserWindow({
                backgroundColor: '#FAFAFA',
                width: 1200,
                height: 900,
                webPreferences: {
                    preload: `${__dirname}/contextBridge.js`,
                    contextIsolation: true,
                    sandbox: false,
                },
                titleBarStyle: 'hidden',
            });

            ipcMain.handle(ELECTRON_EVENTS.REQUEST_DEVICE_ID, () => machineId());

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
            const webRequest = browserWindow.webContents.session.webRequest;
            const validDestinationFilters = {urls: ['https://*.expensify.com/*']};
            /* eslint-disable no-param-reassign */
            if (!__DEV__) {
                // Modify the origin and referer for requests sent to our API
                webRequest.onBeforeSendHeaders(validDestinationFilters, (details, callback) => {
                    details.requestHeaders.origin = CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH;
                    details.requestHeaders.referer = CONFIG.EXPENSIFY.URL_EXPENSIFY_CASH;
                    callback({requestHeaders: details.requestHeaders});
                });
            }

            // Modify access-control-allow-origin header and CSP for the response
            webRequest.onHeadersReceived(validDestinationFilters, (details, callback) => {
                details.responseHeaders['access-control-allow-origin'] = [APP_DOMAIN];
                if (details.responseHeaders['content-security-policy']) {
                    details.responseHeaders['content-security-policy'] = _.map(
                        details.responseHeaders['content-security-policy'],
                        value => (value.startsWith('frame-ancestors') ? `${value} ${APP_DOMAIN}` : value),
                    );
                }
                callback({responseHeaders: details.responseHeaders});
            });
            /* eslint-enable */

            // Prod and staging overwrite the app name in the electron-builder config, so only update it here for dev
            if (__DEV__) {
                browserWindow.setTitle('New Expensify');
            }

            const systemMenu = Menu.getApplicationMenu();

            // Register the custom Paste and Match Style command and place it near the default shortcut of the same role.
            const editMenu = _.find(systemMenu.items, item => item.role === 'editmenu');
            editMenu.submenu.insert(6, new MenuItem({
                role: 'pasteAndMatchStyle',
                accelerator: 'CmdOrCtrl+Shift+V',
            }));

            // Append custom context menu items using the preferred language of the user.
            localizeMenuItems(browserWindow, systemMenu);

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

                // Check if window is fullscreen and exit fullscreen before hiding
                if (browserWindow.isFullScreen()) {
                    browserWindow.once('leave-full-screen', () => browserWindow.hide());
                    browserWindow.setFullScreen(false);
                } else {
                    browserWindow.hide();
                }
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

            browserWindow.on(ELECTRON_EVENTS.FOCUS, () => {
                browserWindow.webContents.send(ELECTRON_EVENTS.FOCUS);
            });
            browserWindow.on(ELECTRON_EVENTS.BLUR, () => {
                browserWindow.webContents.send(ELECTRON_EVENTS.BLUR);
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

            ipcMain.on(ELECTRON_EVENTS.LOCALE_UPDATED, (event, updatedLocale) => {
                // Store the old locale so we can hide/remove these items after adding/showing the new ones.
                const outdatedLocale = preferredLocale;
                preferredLocale = updatedLocale;

                const currentHistoryMenuItem = systemMenu.getMenuItemById(`historyMenuItem-${outdatedLocale}`);
                const currentUpdateAppMenuItem = systemMenu.getMenuItemById(`updateAppMenuItem-${outdatedLocale}`);
                const currentCheckForUpdateMenuItem = systemMenu.getMenuItemById(`checkForUpdateMenuItem-${outdatedLocale}`);
                const currentKeyboardShortcutsMenuItem = systemMenu.getMenuItemById(`keyboardShortcutsMenuItem-${outdatedLocale}`);

                // If we have previously added those languages, don't add new menu items, reshow them.
                if (!systemMenu.getMenuItemById(`updateAppMenuItem-${updatedLocale}`)) {
                    // Update the labels and ids to use the translations.
                    localizeMenuItems(browserWindow, systemMenu);
                }

                // Show the localized menu items if there were visible before we updated the locale.
                systemMenu.getMenuItemById(`updateAppMenuItem-${updatedLocale}`).visible = currentUpdateAppMenuItem.visible;
                systemMenu.getMenuItemById(`checkForUpdateMenuItem-${updatedLocale}`).visible = currentCheckForUpdateMenuItem.visible;
                systemMenu.getMenuItemById(`keyboardShortcutsMenuItem-${updatedLocale}`).visible = currentKeyboardShortcutsMenuItem.visible;
                systemMenu.getMenuItemById(`historyMenuItem-${updatedLocale}`).visible = currentHistoryMenuItem.visible;

                // Since we can't remove menu items, we hide the old ones.
                currentUpdateAppMenuItem.visible = false;
                currentCheckForUpdateMenuItem.visible = false;
                currentKeyboardShortcutsMenuItem.visible = false;
                currentHistoryMenuItem.visible = false;

                Menu.setApplicationMenu(systemMenu);
            });

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
        .then((browserWindowRef) => {
            loadURL(browserWindow).then(() => {
                if (!deeplinkUrl) {
                    return;
                }

                browserWindow.loadURL(deeplinkUrl);
                browserWindow.show();
            });

            return browserWindowRef;
        })

        // Start checking for JS updates
        .then((browserWindowRef) => {
            if (__DEV__) {
                return;
            }

            checkForUpdates(electronUpdater(browserWindowRef));
        });
});

mainWindow().then(window => window);
