import {exec} from 'child_process';
import type {BaseWindow, BrowserView, MenuItem, MenuItemConstructorOptions, WebContents, WebviewTag} from 'electron';
import {app, BrowserWindow, clipboard, dialog, ipcMain, Menu, shell} from 'electron';
import contextMenu from 'electron-context-menu';
import type {ElectronLog} from 'electron-log';
import log from 'electron-log';
import {autoUpdater} from 'electron-updater';
import type {AuthType, PermissionType} from 'node-mac-permissions';
import {machineId} from 'node-machine-id';
import checkForUpdates from '@libs/checkForUpdates';
import {translate} from '@libs/Localize';
import Log from '@libs/Log';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationPaths} from '@src/languages/types';
import type {LocationPermissionState} from '@src/libs/getCurrentPosition/locationPermission';
import {LOCATION_PERMISSION_STATES} from '@src/libs/getCurrentPosition/locationPermission';
import type PlatformSpecificUpdater from '@src/setup/platformSetup/types';
import type {Locale} from '@src/types/onyx';
import type {CreateDownloadQueueModule, DownloadItem} from './createDownloadQueue';
import serve from './electron-serve';
import ELECTRON_EVENTS from './ELECTRON_EVENTS';

const createDownloadQueue = require<CreateDownloadQueueModule>('./createDownloadQueue').default;

const port = process.env.PORT ?? 8082;
const {DESKTOP_SHORTCUT_ACCELERATOR} = CONST;

const MAC_PERMISSION_STATUSES = {
    AUTHORIZED: 'authorized',
    DENIED: 'denied',
    RESTRICTED: 'restricted',
    NOT_DETERMINED: 'not determined',
} as const;

type MacPermissionsModule = {
    getAuthStatus?: (authType: AuthType) => PermissionType | typeof MAC_PERMISSION_STATUSES.NOT_DETERMINED;
};

type MacGetAuthStatus = MacPermissionsModule['getAuthStatus'];

let macGetAuthStatusPromise: Promise<MacGetAuthStatus | undefined> | undefined;

const logMacPermissionsWarning = (message: string, error?: unknown) => {
    if (error instanceof Error) {
        log.warn(message, error.message);
    } else if (typeof error === 'string') {
        log.warn(message, error);
    } else {
        log.warn(message);
    }
};

const loadMacGetAuthStatus = async (): Promise<MacGetAuthStatus | undefined> => {
    if (!macGetAuthStatusPromise) {
        if (process.platform !== 'darwin') {
            macGetAuthStatusPromise = Promise.resolve<MacGetAuthStatus | undefined>(undefined);
        } else {
            try {
                macGetAuthStatusPromise = Promise.resolve(((await import('node-mac-permissions')) as MacPermissionsModule).getAuthStatus);
            } catch (error: unknown) {
                logMacPermissionsWarning('node-mac-permissions not available, defaulting to denied:', error);
                return undefined;
            }
        }
    }

    return macGetAuthStatusPromise;
};

const resolveLocationPermissionStatus = (status: PermissionType | typeof MAC_PERMISSION_STATUSES.NOT_DETERMINED): LocationPermissionState => {
    switch (status) {
        case MAC_PERMISSION_STATUSES.AUTHORIZED:
            return LOCATION_PERMISSION_STATES.GRANTED;
        case MAC_PERMISSION_STATUSES.NOT_DETERMINED:
            return LOCATION_PERMISSION_STATES.PROMPT;
        case MAC_PERMISSION_STATUSES.DENIED:
        case MAC_PERMISSION_STATUSES.RESTRICTED:
        default:
            return LOCATION_PERMISSION_STATES.DENIED;
    }
};

// Setup google api key in process environment, we are setting it this way intentionally. It is required by the
// geolocation api (window.navigator.geolocation.getCurrentPosition) to work on desktop.
// Source: https://github.com/electron/electron/blob/98cd16d336f512406eee3565be1cead86514db7b/docs/api/environment-variables.md#google_api_key
process.env.GOOGLE_API_KEY = CONFIG.GCP_GEOLOCATION_API_KEY;
/**
 * Suppresses Content Security Policy (CSP) console warnings related to 'unsafe-eval'.
 * This is required because:
 * 1. Webpack utilizes eval() for module bundling
 * 2. The application requires 'unsafe-eval' in CSP to function properly
 * Note: CSP warnings are expected and unavoidable in this context
 */
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = CONFIG.ELECTRON_DISABLE_SECURITY_WARNINGS;

app.setName('New Expensify');

/**
 * Electron main process that handles wrapping the web application.
 *
 * @see: https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */

// This is necessary for NetInfo to work correctly as it does not handle the NetworkInformation API events correctly
// See: https://github.com/electron/electron/issues/22597
app.commandLine.appendSwitch('enable-network-information-downlink-max');

/**
 * Inserts the plain text from the clipboard into the provided browser window's web contents.
 *
 * @param browserWindow - The Electron BrowserWindow instance where the text should be inserted.
 */
function pasteAsPlainText(browserWindow: BrowserWindow | BrowserView | WebviewTag | WebContents) {
    const text = clipboard.readText();

    if ('webContents' in browserWindow) {
        // https://github.com/sindresorhus/electron-context-menu is passing in deprecated `BrowserView` to this function
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        browserWindow.webContents.insertText(text);
    }
}

/**
 * Initialize the right-click menu
 * See https://github.com/sindresorhus/electron-context-menu
 *
 * @param preferredLocale - The current user language to be used for translating menu labels.
 * @returns A dispose function to clean up the created context menu.
 */
function createContextMenu(preferredLocale: Locale): () => void {
    return contextMenu({
        labels: {
            cut: translate(preferredLocale, 'desktopApplicationMenu.cut'),
            paste: translate(preferredLocale, 'desktopApplicationMenu.paste'),
            copy: translate(preferredLocale, 'desktopApplicationMenu.copy'),
        },
        append: (defaultActions, parameters, browserWindow) => [
            {
                // Only enable the menu item for Editable context which supports paste
                visible: parameters.isEditable && parameters.editFlags.canPaste,
                role: 'pasteAndMatchStyle',
                accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AND_MATCH_STYLE,
                label: translate(preferredLocale, 'desktopApplicationMenu.pasteAndMatchStyle'),
            },
            {
                label: translate(preferredLocale, 'desktopApplicationMenu.pasteAsPlainText'),
                visible: parameters.isEditable && parameters.editFlags.canPaste && clipboard.readText().length > 0,
                accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AS_PLAIN_TEXT,
                click: () => pasteAsPlainText(browserWindow),
            },
        ],
    });
}

let disposeContextMenu: (() => void) | undefined;

// Send all autoUpdater logs to a log file: ~/Library/Logs/new.expensify.desktop/main.log
// See https://www.npmjs.com/package/electron-log
autoUpdater.logger = log;
(autoUpdater.logger as ElectronLog).transports.file.level = 'info';

// Send all Console logs to a log file: ~/Library/Logs/new.expensify.desktop/main.log
// See https://www.npmjs.com/package/electron-log
Object.assign(console, log.functions);

// This sets up the command line arguments used to manage the update. When
// the --expected-update-version flag is set, the app will open pre-hidden
// until it detects that it has been upgraded to the correct version.

const EXPECTED_UPDATE_VERSION_FLAG = '--expected-update-version';
const APP_DOMAIN = __DEV__ ? `https://dev.new.expensify.com:${port}` : 'app://-';

let expectedUpdateVersion: string;
for (const arg of process.argv) {
    if (!arg.startsWith(`${EXPECTED_UPDATE_VERSION_FLAG}=`)) {
        continue;
    }

    expectedUpdateVersion = arg.slice(`${EXPECTED_UPDATE_VERSION_FLAG}=`.length);
}

// Add the listeners and variables required to ensure that auto-updating
// happens correctly.
let hasUpdate = false;
let downloadedVersion: string;
let isSilentUpdating = false;
let isUpdateInProgress = false;
let preferredLocale: Locale | undefined;

const appProtocol = CONST.DEEPLINK_BASE_URL.replace('://', '');

const quitAndInstallWithUpdate = () => {
    if (!downloadedVersion) {
        return;
    }
    hasUpdate = true;
    autoUpdater.quitAndInstall();
};

const verifyAndInstallLatestVersion = (browserWindow: BrowserWindow): void => {
    if (!browserWindow || browserWindow.isDestroyed()) {
        return;
    }

    // Prevent multiple simultaneous updates
    if (isUpdateInProgress) {
        return;
    }

    isUpdateInProgress = true;

    autoUpdater
        .checkForUpdates()
        .then((result) => {
            if (!browserWindow || browserWindow.isDestroyed()) {
                isUpdateInProgress = false;
                return;
            }

            if (result?.updateInfo.version === downloadedVersion) {
                return quitAndInstallWithUpdate();
            }

            return autoUpdater.downloadUpdate().then(() => {
                return quitAndInstallWithUpdate();
            });
        })
        .catch((error) => {
            log.error('Error during update check or download:', error);
        })
        .finally(() => {
            isUpdateInProgress = false;
        });
};

/** Menu Item callback to trigger an update check */
const manuallyCheckForUpdates = (menuItem?: MenuItem, browserWindow?: BaseWindow) => {
    // Prevent multiple simultaneous updates
    if (isUpdateInProgress) {
        return;
    }

    if (menuItem) {
        // Disable item until the check (and download) is complete
        // eslint-disable-next-line no-param-reassign -- menu item flags like enabled or visible can be dynamically toggled by mutating the object
        menuItem.enabled = false;
    }

    isUpdateInProgress = true;

    autoUpdater
        .checkForUpdates()
        .catch((error: unknown) => {
            isSilentUpdating = false;
            return {error};
        })
        .then((result) => {
            const downloadPromise = result && 'downloadPromise' in result ? result.downloadPromise : undefined;

            if (!browserWindow || !preferredLocale) {
                return;
            }

            if (downloadPromise) {
                dialog.showMessageBox(browserWindow, {
                    type: 'info',
                    message: translate(preferredLocale, 'checkForUpdatesModal.available.title'),
                    detail: translate(preferredLocale, 'checkForUpdatesModal.available.message', {isSilentUpdating}),
                    buttons: [translate(preferredLocale, 'checkForUpdatesModal.available.soundsGood')],
                });
            } else if (result && 'error' in result && result.error) {
                dialog.showMessageBox(browserWindow, {
                    type: 'error',
                    message: translate(preferredLocale, 'checkForUpdatesModal.error.title'),
                    detail: translate(preferredLocale, 'checkForUpdatesModal.error.message'),
                    buttons: [translate(preferredLocale, 'checkForUpdatesModal.notAvailable.okay')],
                });
            } else {
                dialog.showMessageBox(browserWindow, {
                    type: 'info',
                    message: translate(preferredLocale, 'checkForUpdatesModal.notAvailable.title'),
                    detail: translate(preferredLocale, 'checkForUpdatesModal.notAvailable.message'),
                    buttons: [translate(preferredLocale, 'checkForUpdatesModal.notAvailable.okay')],
                    cancelId: 2,
                });
            }

            // By returning the `downloadPromise` we keep "check for updates" disabled if any updates are being downloaded
            return downloadPromise;
        })
        .finally(() => {
            isSilentUpdating = false;
            isUpdateInProgress = false;
            if (!menuItem) {
                return;
            }
            // eslint-disable-next-line no-param-reassign
            menuItem.enabled = true;
        });
};

/** Trigger event to show keyboard shortcuts */
const showKeyboardShortcutsPage = (browserWindow: BrowserWindow) => {
    if (!browserWindow.isVisible()) {
        return;
    }
    browserWindow.webContents.send(ELECTRON_EVENTS.KEYBOARD_SHORTCUTS_PAGE);
};

/** Actual auto-update listeners */
const electronUpdater = (browserWindow: BrowserWindow): PlatformSpecificUpdater => ({
    init: () => {
        autoUpdater.on(ELECTRON_EVENTS.UPDATE_DOWNLOADED, (info) => {
            const systemMenu = Menu.getApplicationMenu();
            const updateMenuItem = systemMenu?.getMenuItemById(`update`);
            const checkForUpdatesMenuItem = systemMenu?.getMenuItemById(`checkForUpdates`);

            downloadedVersion = info.version;

            if (updateMenuItem) {
                updateMenuItem.visible = true;
            }
            if (checkForUpdatesMenuItem) {
                checkForUpdatesMenuItem.visible = false;
            }
            if (browserWindow.isVisible() && !isSilentUpdating) {
                browserWindow.webContents.send(ELECTRON_EVENTS.UPDATE_DOWNLOADED, info.version);
            } else {
                verifyAndInstallLatestVersion(browserWindow);
            }
        });

        ipcMain.on(ELECTRON_EVENTS.START_UPDATE, () => {
            verifyAndInstallLatestVersion(browserWindow);
        });
        autoUpdater.checkForUpdates();
    },
    update: () => {
        autoUpdater.checkForUpdates();
    },
});

const localizeMenuItems = (submenu: MenuItemConstructorOptions[], updatedLocale: Locale): MenuItemConstructorOptions[] =>
    submenu.map((menu) => {
        const newMenu: MenuItemConstructorOptions = {...menu};
        if (menu.id) {
            const labelTranslation = translate(updatedLocale, `desktopApplicationMenu.${menu.id}` as TranslationPaths);
            if (labelTranslation) {
                newMenu.label = labelTranslation;
            }
        }
        if (menu.submenu) {
            newMenu.submenu = localizeMenuItems(menu.submenu as MenuItemConstructorOptions[], updatedLocale);
        }
        return newMenu;
    });

const mainWindow = (): Promise<void> => {
    let deeplinkUrl: string;
    let browserWindow: BrowserWindow;

    const loadURL = __DEV__ ? (win: BrowserWindow): Promise<void> => win.loadURL(`https://dev.new.expensify.com:${port}`) : serve({directory: `${__dirname}/www`});

    // Prod and staging set the icon in the electron-builder config, so only update it here for dev
    if (__DEV__) {
        app?.dock?.setIcon(`${__dirname}/../icon-dev.png`);
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
                    minWidth: 375,
                    minHeight: 600,
                    webPreferences: {
                        preload: `${__dirname}/contextBridge.js`,
                        contextIsolation: true,
                        sandbox: false,
                    },
                    titleBarStyle: 'hidden',
                });

                ipcMain.handle(ELECTRON_EVENTS.REQUEST_DEVICE_ID, () => machineId());
                ipcMain.handle(ELECTRON_EVENTS.OPEN_LOCATION_SETTING, () => {
                    if (process.platform !== 'darwin') {
                        // Platform not supported for location settings
                        return Promise.resolve(undefined);
                    }

                    return new Promise((resolve, reject) => {
                        const command = 'open x-apple.systempreferences:com.apple.preference.security?Privacy_Location';

                        exec(command, (error) => {
                            if (error) {
                                console.error('Error opening location settings:', error);
                                reject(error);
                                return;
                            }
                            resolve(undefined);
                        });
                    });
                });

                ipcMain.handle(ELECTRON_EVENTS.CHECK_LOCATION_PERMISSION, async () => {
                    const getAuthStatus = await loadMacGetAuthStatus();

                    if (!getAuthStatus) {
                        return LOCATION_PERMISSION_STATES.DENIED;
                    }

                    try {
                        return resolveLocationPermissionStatus(getAuthStatus('location'));
                    } catch (error) {
                        log.warn('node-mac-permissions threw while checking location permission, defaulting to denied:', (error as Error)?.message);
                        return LOCATION_PERMISSION_STATES.DENIED;
                    }
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
                const webRequest = browserWindow.webContents.session.webRequest;
                const validDestinationFilters = {urls: ['https://*.expensify.com/*']};
                /* eslint-disable no-param-reassign */
                if (!__DEV__) {
                    // Modify the origin and referer for requests sent to our API
                    webRequest.onBeforeSendHeaders(validDestinationFilters, (details, callback) => {
                        callback({requestHeaders: details.requestHeaders});
                    });
                }

                // Modify access-control-allow-origin header and CSP for the response
                webRequest.onHeadersReceived(validDestinationFilters, (details, callback) => {
                    if (details.responseHeaders) {
                        details.responseHeaders['access-control-allow-origin'] = [APP_DOMAIN];
                    }
                    if (details.responseHeaders?.['content-security-policy']) {
                        details.responseHeaders['content-security-policy'] = details.responseHeaders['content-security-policy'].map((value) =>
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

                const initialMenuTemplate: MenuItemConstructorOptions[] = [
                    {
                        id: 'mainMenu',
                        submenu: [
                            {id: 'about', role: 'about'},
                            {
                                id: 'update',
                                click: () => verifyAndInstallLatestVersion(browserWindow),
                                visible: false,
                            },
                            {id: 'checkForUpdates', click: manuallyCheckForUpdates},
                            {
                                id: 'viewShortcuts',
                                accelerator: 'CmdOrCtrl+J',
                                click: () => {
                                    showKeyboardShortcutsPage(browserWindow);
                                },
                            },
                            {type: 'separator'},
                            {id: 'services', role: 'services'},
                            {type: 'separator'},
                            {id: 'hide', role: 'hide'},
                            {id: 'hideOthers', role: 'hideOthers'},
                            {id: 'showAll', role: 'unhide'},
                            {type: 'separator'},
                            {id: 'quit', role: 'quit'},
                        ],
                    },
                    {
                        id: 'fileMenu',
                        submenu: [{id: 'closeWindow', role: 'close', accelerator: 'Cmd+w'}],
                    },
                    {
                        id: 'editMenu',
                        submenu: [
                            {id: 'undo', role: 'undo'},
                            {id: 'redo', role: 'redo'},
                            {type: 'separator'},
                            {id: 'cut', role: 'cut'},
                            {id: 'copy', role: 'copy'},
                            {id: 'paste', role: 'paste'},
                            {
                                id: 'pasteAndMatchStyle',
                                role: 'pasteAndMatchStyle',
                                accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AND_MATCH_STYLE,
                            },
                            {
                                id: 'pasteAsPlainText',
                                accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AS_PLAIN_TEXT,
                                click: () => pasteAsPlainText(browserWindow),
                            },
                            {id: 'delete', role: 'delete'},
                            {id: 'selectAll', role: 'selectAll'},
                            {type: 'separator'},
                            {
                                id: 'speechSubmenu',
                                submenu: [
                                    {id: 'startSpeaking', role: 'startSpeaking'},
                                    {id: 'stopSpeaking', role: 'stopSpeaking'},
                                ],
                            },
                        ],
                    },
                    {
                        id: 'viewMenu',
                        submenu: [
                            {id: 'reload', role: 'reload'},
                            {id: 'forceReload', role: 'forceReload'},
                            {id: 'toggleDevTools', role: 'toggleDevTools'},
                            {type: 'separator'},
                            {id: 'resetZoom', role: 'resetZoom'},
                            {id: 'zoomIn', role: 'zoomIn'},
                            {id: 'zoomOut', role: 'zoomOut'},
                            {type: 'separator'},
                            {id: 'togglefullscreen', role: 'togglefullscreen'},
                        ],
                    },
                    {
                        id: 'historyMenu',
                        submenu: [
                            {
                                id: 'back',
                                accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Shift+[',
                                click: () => {
                                    browserWindow.webContents.navigationHistory.goBack();
                                },
                            },
                            {
                                label: 'backWithKeyShortcut',
                                visible: false,
                                accelerator: process.platform === 'darwin' ? 'Cmd+Left' : 'Shift+Left',
                                click: () => {
                                    browserWindow.webContents.navigationHistory.goBack();
                                },
                            },
                            {
                                id: 'forward',
                                accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Shift+]',
                                click: () => {
                                    browserWindow.webContents.navigationHistory.goForward();
                                },
                            },
                            {
                                label: 'forwardWithKeyShortcut',
                                visible: false,
                                accelerator: process.platform === 'darwin' ? 'Cmd+Right' : 'Shift+Right',
                                click: () => {
                                    browserWindow.webContents.navigationHistory.goForward();
                                },
                            },
                        ],
                    },
                    {
                        id: 'windowMenu',
                        role: 'windowMenu',
                        submenu: [{id: 'minimize', role: 'minimize'}, {id: 'zoom', role: 'zoom'}, {type: 'separator'}, {id: 'front', role: 'front'}],
                    },
                    {
                        id: 'helpMenu',
                        role: 'help',
                        submenu: [
                            {
                                id: 'learnMore',
                                click: () => {
                                    shell.openExternal(CONST.MENU_HELP_URLS.LEARN_MORE);
                                },
                            },
                            {
                                id: 'documentation',
                                click: () => {
                                    shell.openExternal(CONST.MENU_HELP_URLS.DOCUMENTATION);
                                },
                            },
                            {
                                id: 'communityDiscussions',
                                click: () => {
                                    shell.openExternal(CONST.MENU_HELP_URLS.COMMUNITY_DISCUSSIONS);
                                },
                            },
                            {
                                id: 'searchIssues',
                                click: () => {
                                    shell.openExternal(CONST.MENU_HELP_URLS.SEARCH_ISSUES);
                                },
                            },
                        ],
                    },
                ];

                // When the user clicks a link that has target="_blank" (which is all external links)
                // open the default browser instead of a new electron window
                browserWindow.webContents.setWindowOpenHandler(({url}) => {
                    const denial = {action: 'deny'} as const;

                    // Make sure local urls stay in electron perimeter
                    if (url.slice(0, 'file://'.length).toLowerCase() === 'file://') {
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
                        browserWindow.webContents.navigationHistory.goBack();
                    }
                    if (cmd === 'browser-forward') {
                        browserWindow.webContents.navigationHistory.goForward();
                    }
                });

                browserWindow.on('swipe', (e, direction) => {
                    if (direction === 'left') {
                        browserWindow.webContents.navigationHistory.goBack();
                    }
                    if (direction === 'right') {
                        browserWindow.webContents.navigationHistory.goForward();
                    }
                });

                browserWindow.on(ELECTRON_EVENTS.FOCUS, () => {
                    browserWindow.webContents.send(ELECTRON_EVENTS.FOCUS);
                });
                browserWindow.on(ELECTRON_EVENTS.BLUR, () => {
                    browserWindow.webContents.send(ELECTRON_EVENTS.BLUR);
                });

                // Handle renderer process crashes by relaunching the app
                browserWindow.webContents.on('render-process-gone', (event, detailed) => {
                    if (detailed.reason === 'crashed') {
                        // relaunch app
                        app.relaunch({args: process.argv.slice(1).concat(['--relaunch'])});
                        app.exit(0);
                    }
                    Log.info('App crashed  render-process-gone');
                    Log.info(JSON.stringify(detailed));
                });

                app.on('before-quit', () => {
                    // Adding __DEV__ check because we want links to be handled by dev app only while it's running
                    // https://github.com/Expensify/App/issues/15965#issuecomment-1483182952
                    if (__DEV__) {
                        app.removeAsDefaultProtocolClient(appProtocol);
                    }

                    // Clean up update listeners and reset flags
                    autoUpdater.removeAllListeners();
                    isUpdateInProgress = false;
                    isSilentUpdating = false;

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

                // Note that we have to subscribe to this separately since we cannot listen to Onyx.connect here,
                // because the only way code can be shared between the main and renderer processes at runtime is via the context bridge
                // So we track preferredLocale separately via ELECTRON_EVENTS.LOCALE_UPDATED
                ipcMain.on(ELECTRON_EVENTS.LOCALE_UPDATED, (event, updatedLocale: Locale) => {
                    IntlStore.load(updatedLocale).then(() => {
                        preferredLocale = updatedLocale;
                        Menu.setApplicationMenu(Menu.buildFromTemplate(localizeMenuItems(initialMenuTemplate, updatedLocale)));
                        disposeContextMenu?.();
                        disposeContextMenu = createContextMenu(updatedLocale);
                    });
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
                ipcMain.on(ELECTRON_EVENTS.REQUEST_UPDATE_BADGE_COUNT, (event, totalCount?: number) => {
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

                const downloadQueue = createDownloadQueue();
                ipcMain.on(ELECTRON_EVENTS.DOWNLOAD, (event, downloadData: DownloadItem) => {
                    const downloadItem: DownloadItem = {
                        ...downloadData,
                        win: browserWindow,
                    };
                    downloadQueue.enqueueDownloadItem(downloadItem);
                });

                // Automatically check for and install the latest version in the background
                ipcMain.on(ELECTRON_EVENTS.SILENT_UPDATE, () => {
                    if (isSilentUpdating) {
                        return;
                    }
                    isSilentUpdating = true;
                    manuallyCheckForUpdates(undefined, browserWindow);
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
