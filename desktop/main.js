const {app, dialog, BrowserWindow, Menu, MenuItem, shell, ipcMain} = require('electron');
const _ = require('underscore');
const serve = require('electron-serve');
const contextMenu = require('electron-context-menu');
const {autoUpdater} = require('electron-updater');
const log = require('electron-log');
const {machineId} = require('node-machine-id');
const ELECTRON_EVENTS = require('./ELECTRON_EVENTS');
const checkForUpdates = require('../src/libs/checkForUpdates');
const CONFIG = require('../src/CONFIG').default;
const CONST = require('../src/CONST').default;
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
        expectedUpdateVersion = arg.substr(`${EXPECTED_UPDATE_VERSION_FLAG}=`.length);
    }
}

// Add the listeners and variables required to ensure that auto-updating
// happens correctly.
let hasUpdate = false;
let downloadedVersion;

// Note that we have to subscribe to this separately and cannot use Localize.translateLocal,
// because the only way code can be shared between the main and renderer processes at runtime is via the context bridge
// So we track preferredLocale separately via ELECTRON_EVENTS.LOCALE_UPDATED
const preferredLocale = CONST.LOCALES.DEFAULT;

const appProtocol = CONST.DEEPLINK_BASE_URL.replace('://', '');

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

    autoUpdater
        .checkForUpdates()
        .catch((error) => ({error}))
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
const electronUpdater = (browserWindow) => ({
    init: () => {
        autoUpdater.on(ELECTRON_EVENTS.UPDATE_DOWNLOADED, (info) => {
            const systemMenu = Menu.getApplicationMenu();
            downloadedVersion = info.version;
            systemMenu.getMenuItemById(`update`).visible = true;
            systemMenu.getMenuItemById(`check-for-updates`).visible = false;
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

const mainWindow = () => {
    let deeplinkUrl;
    let browserWindow;

    const loadURL = __DEV__ ? (win) => win.loadURL(`http://localhost:${port}`) : serve({directory: `${__dirname}/www`});

    // Prod and staging set the icon in the electron-builder config, so only update it here for dev
    if (__DEV__) {
        console.debug('CONFIG: ', CONFIG);
        app.dock.setIcon(`${__dirname}/../icon-dev.png`);
        app.setName('New Expensify Dev');
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
    return (
        app
            .whenReady()
            .then(() => {
                /**
                 * We only want to register the scheme this way when in dev, since
                 * when the app is bundled electron-builder will take care of it.
                 */
                if (__DEV__) {
                    app.setAsDefaultProtocolClient(appProtocol);
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
                        details.responseHeaders['content-security-policy'] = _.map(details.responseHeaders['content-security-policy'], (value) =>
                            value.startsWith('frame-ancestors') ? `${value} ${APP_DOMAIN}` : value,
                        );
                    }
                    callback({responseHeaders: details.responseHeaders});
                });
                /* eslint-enable */

                // Prod and staging overwrite the app name in the electron-builder config, so only update it here for dev
                if (__DEV__) {
                    browserWindow.setTitle('New Expensify');
                }

                const setLabelsInMenuTemplate = (submenu, labels) =>
                    _.map(submenu, (menu) => {
                        const newMenu = _.clone(menu);
                        const labelTranslation = _.find(labels, (translation) => translation.id === menu.id);
                        if (labelTranslation && labelTranslation.label) {
                            newMenu.label = labelTranslation.label;
                        }
                        if (menu.submenu) {
                            newMenu.submenu = setLabelsInMenuTemplate(menu.submenu, labels);
                        }
                        return newMenu;
                    });

                const labelsEng = [
                    {id: 'main-menu', label: 'New Expensify'},
                    {id: 'about', label: 'About New Expensify'},
                    {id: 'update', label: 'Update New Expensify'},
                    {id: 'check-for-updates', label: 'Check for updates'},
                    {id: 'view-shortcuts', label: 'View keyboard shortcuts'},
                    {id: 'services', label: 'Services'},
                    {id: 'hide', label: 'Hide New Expensify'},
                    {id: 'hide-others', label: 'Hide Others'},
                    {id: 'show-all', label: 'Show All'},
                    {id: 'quit', label: 'Quit New Expensify'},

                    {id: 'file-menu', label: 'File'},
                    {id: 'close-window', label: 'Close Window'},

                    {id: 'edit-menu', label: 'Edit'},
                    {id: 'undo', label: 'Undo'},
                    {id: 'redo', label: 'Redo'},
                    {id: 'cut', label: 'Cut'},
                    {id: 'copy', label: 'Copy'},
                    {id: 'paste', label: 'Paste'},
                    {id: 'pasteAndMatchStyle', label: 'Paste and Match Style'},
                    {id: 'delete', label: 'Delete'},
                    {id: 'selectAll', label: 'Select All'},
                    {id: 'speech-submenu', label: 'Speech'},
                    {id: 'startSpeaking', label: 'Start Speaking'},
                    {id: 'stopSpeaking', label: 'Stop Speaking'},

                    {id: 'view-menu', label: 'View'},
                    {id: 'reload', label: 'Reload'},
                    {id: 'forceReload', label: 'Force Reload'},
                    {id: 'resetZoom', label: 'Actual Size'},
                    {id: 'zoomIn', label: 'Zoom In'},
                    {id: 'zoomOut', label: 'Zoom Out'},
                    {id: 'togglefullscreen', label: 'Toggle Full Screen'},

                    {id: 'history-menu', label: 'History'},
                    {id: 'back', label: 'Back'},
                    {id: 'forward', label: 'Forward'},

                    {id: 'window-menu', label: 'Window'},

                    {id: 'help-menu', label: 'Help'},
                    {id: 'learn-more', label: 'Learn more'},
                    {id: 'documentation', label: 'Documentation'},
                    {id: 'community-discissions', label: 'Community Discussions'},
                    {id: 'search-issues', label: 'Search Issues'},
                ];

                const labelsEsp = [
                    {id: 'main-menu', label: 'Nuevo Expensify'},
                    {id: 'about', label: 'Sobre Nuevo Expensify'},
                    {id: 'update', label: 'Actualizar Nuevo Expensify'},
                    {id: 'check-for-updates', label: 'Buscar actualizaciones'},
                    {id: 'view-shortcuts', label: 'Ver atajos de teclado'},
                    {id: 'services', label: 'Servicios'},
                    {id: 'hide', label: 'Ocultar Nuevo Expensify'},
                    {id: 'hide-others', label: 'Ocultar otros'},
                    {id: 'show-all', label: 'Mostrar todos'},
                    {id: 'quit', label: 'Salir de Nuevo Expensify'},

                    {id: 'file-menu', label: 'Archivo'},
                    {id: 'close-window', label: 'Cerrar ventana'},

                    {id: 'edit-menu', label: 'Editar'},
                    {id: 'undo', label: 'Deshacer'},
                    {id: 'redo', label: 'Rehacer'},
                    {id: 'cut', label: 'Cortar'},
                    {id: 'copy', label: 'Copiar'},
                    {id: 'paste', label: 'Pegar'},
                    {id: 'pasteAndMatchStyle', label: 'Pegar adaptando el estilo'},
                    {id: 'delete', label: 'Eliminar'},
                    {id: 'selectAll', label: 'Seleccionar todo'},
                    {id: 'speech-submenu', label: 'Voz'},
                    {id: 'startSpeaking', label: 'Empezar a hablar'},
                    {id: 'stopSpeaking', label: 'Dejar de Hablar'},

                    {id: 'view-menu', label: 'Ver'},
                    {id: 'reload', label: 'Cargar de nuevo'},
                    {id: 'forceReload', label: 'Forzar recarga'},
                    {id: 'resetZoom', label: 'Tamaño real'},
                    {id: 'zoomIn', label: 'Acercar'},
                    {id: 'zoomOut', label: 'Alejar'},
                    {id: 'togglefullscreen', label: 'Alternar pantalla completa'},

                    {id: 'history-menu', label: 'Historial'},
                    {id: 'back', label: 'Atrás'},
                    {id: 'forward', label: 'Adelante'},

                    {id: 'window-menu', label: 'Ventana'},

                    {id: 'help-menu', label: 'Ayuda'},
                    {id: 'learn-more', label: 'Más información'},
                    {id: 'documentation', label: 'Documentación'},
                    {id: 'community-discissions', label: 'Debates de la comunidad'},
                    {id: 'search-issues', label: 'Buscar problemas'},
                ];

                const initialMenuTemplate = [
                    {
                        id: 'main-menu',
                        label: 'New Expensify',
                        submenu: [
                            {id: 'about', role: 'about'},
                            {id: 'update', label: 'Update new Expensify', click: quitAndInstallWithUpdate, visible: false},
                            {id: 'check-for-updates', label: 'Check for updates', click: manuallyCheckForUpdates},
                            {
                                id: 'view-shortcuts',
                                label: 'View keyboard shortcuts',
                                accelerator: 'CmdOrCtrl+I',
                                click: () => {
                                    showKeyboardShortcutsModal(browserWindow);
                                },
                            },
                            {type: 'separator'},
                            {id: 'services', role: 'services'},
                            {type: 'separator'},
                            {id: 'hide', role: 'hide'},
                            {id: 'hide-others', role: 'hideOthers'},
                            {id: 'show-all', role: 'unhide'},
                            {type: 'separator'},
                            {id: 'quit', role: 'quit'},
                        ],
                    },
                    {
                        id: 'file-menu',
                        label: 'File',
                        submenu: [{id: 'close-window', role: 'close', accelerator: 'Cmd+w'}],
                    },
                    {
                        id: 'edit-menu',
                        label: 'Edit',
                        submenu: [
                            {id: 'undo', role: 'undo'},
                            {id: 'redo', role: 'redo'},
                            {type: 'separator'},
                            {id: 'cut', role: 'cut'},
                            {id: 'copy', role: 'copy'},
                            {id: 'paste', role: 'paste'},
                            {id: 'pasteAndMatchStyle', role: 'pasteAndMatchStyle'},
                            {id: 'delete', role: 'delete'},
                            {id: 'selectAll', role: 'selectAll'},
                            {type: 'separator'},
                            {
                                id: 'speech-submenu',
                                label: 'Speech',
                                submenu: [
                                    {id: 'startSpeaking', role: 'startSpeaking'},
                                    {id: 'stopSpeaking', role: 'stopSpeaking'},
                                ],
                            },
                        ],
                    },
                    {
                        id: 'view-menu',
                        label: 'View',
                        submenu: [
                            {id: 'reload', role: 'reload'},
                            {id: 'forceReload', role: 'forceReload'},
                            {type: 'separator'},
                            {id: 'resetZoom', role: 'resetZoom'},
                            {id: 'zoomIn', role: 'zoomIn'},
                            {id: 'zoomOut', role: 'zoomOut'},
                            {type: 'separator'},
                            {id: 'togglefullscreen', role: 'togglefullscreen'},
                        ],
                    },
                    {
                        id: 'history-menu',
                        label: 'History',
                        submenu: [
                            {
                                id: 'back',
                                role: 'back',
                                accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Shift+[',
                                click: () => {
                                    browserWindow.webContents.goBack();
                                },
                            },
                            {
                                id: 'forward',
                                role: 'forward',
                                accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Shift+]',
                                click: () => {
                                    browserWindow.webContents.goForward();
                                },
                            },
                        ],
                    },
                    {
                        id: 'window-menu',
                        role: 'windowMenu',
                    },
                    {
                        id: 'help-menu',
                        label: 'Help',
                        role: 'help',
                        submenu: [
                            {id: 'learn-more', label: 'Learn more'},
                            {id: 'documentation', label: 'Documentation'},
                            {id: 'community-discissions', label: 'Community Discussions'},
                            {id: 'search-issues', label: 'Search Issues'},
                        ],
                    },
                ];

                const translatedMenu = setLabelsInMenuTemplate(initialMenuTemplate, labelsEng);

                // Build and set the initial menu
                const initialMenu = Menu.buildFromTemplate(translatedMenu);
                Menu.setApplicationMenu(initialMenu);

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

                app.on('before-quit', () => {
                    // Adding __DEV__ check because we want links to be handled by dev app only while it's running
                    // https://github.com/Expensify/App/issues/15965#issuecomment-1483182952
                    if (__DEV__) {
                        app.removeAsDefaultProtocolClient(appProtocol);
                    }
                    quitting = true;
                });
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
                    if (updatedLocale === 'en') {
                        Menu.setApplicationMenu(Menu.buildFromTemplate(setLabelsInMenuTemplate(initialMenuTemplate, labelsEng)));
                    } else if (updatedLocale === 'es') {
                        Menu.setApplicationMenu(Menu.buildFromTemplate(setLabelsInMenuTemplate(initialMenuTemplate, labelsEsp)));
                    }
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
            })
    );
};

mainWindow().then((window) => window);
