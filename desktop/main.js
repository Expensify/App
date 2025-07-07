"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var electron_1 = require("electron");
var electron_context_menu_1 = require("electron-context-menu");
var electron_log_1 = require("electron-log");
var electron_updater_1 = require("electron-updater");
var node_machine_id_1 = require("node-machine-id");
var checkForUpdates_1 = require("@libs/checkForUpdates");
var Localize_1 = require("@libs/Localize");
var Log_1 = require("@libs/Log");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var electron_serve_1 = require("./electron-serve");
var ELECTRON_EVENTS_1 = require("./ELECTRON_EVENTS");
var createDownloadQueue = require('./createDownloadQueue').default;
var port = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : 8082;
var DESKTOP_SHORTCUT_ACCELERATOR = CONST_1.default.DESKTOP_SHORTCUT_ACCELERATOR;
// Setup google api key in process environment, we are setting it this way intentionally. It is required by the
// geolocation api (window.navigator.geolocation.getCurrentPosition) to work on desktop.
// Source: https://github.com/electron/electron/blob/98cd16d336f512406eee3565be1cead86514db7b/docs/api/environment-variables.md#google_api_key
process.env.GOOGLE_API_KEY = CONFIG_1.default.GCP_GEOLOCATION_API_KEY;
/**
 * Suppresses Content Security Policy (CSP) console warnings related to 'unsafe-eval'.
 * This is required because:
 * 1. Webpack utilizes eval() for module bundling
 * 2. The application requires 'unsafe-eval' in CSP to function properly
 * Note: CSP warnings are expected and unavoidable in this context
 */
process.env.ELECTRON_DISABLE_SECURITY_WARNINGS = CONFIG_1.default.ELECTRON_DISABLE_SECURITY_WARNINGS;
electron_1.app.setName('New Expensify');
/**
 * Electron main process that handles wrapping the web application.
 *
 * @see: https://www.electronjs.org/docs/tutorial/application-architecture#main-and-renderer-processes
 */
// This is necessary for NetInfo to work correctly as it does not handle the NetworkInformation API events correctly
// See: https://github.com/electron/electron/issues/22597
electron_1.app.commandLine.appendSwitch('enable-network-information-downlink-max');
/**
 * Inserts the plain text from the clipboard into the provided browser window's web contents.
 *
 * @param browserWindow - The Electron BrowserWindow instance where the text should be inserted.
 */
function pasteAsPlainText(browserWindow) {
    var text = electron_1.clipboard.readText();
    if ('webContents' in browserWindow) {
        // https://github.com/sindresorhus/electron-context-menu is passing in deprecated `BrowserView` to this function
        // eslint-disable-next-line deprecation/deprecation
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
function createContextMenu(preferredLocale) {
    return (0, electron_context_menu_1.default)({
        labels: {
            cut: (0, Localize_1.translate)(preferredLocale, 'desktopApplicationMenu.cut'),
            paste: (0, Localize_1.translate)(preferredLocale, 'desktopApplicationMenu.paste'),
            copy: (0, Localize_1.translate)(preferredLocale, 'desktopApplicationMenu.copy'),
        },
        append: function (defaultActions, parameters, browserWindow) { return [
            {
                // Only enable the menu item for Editable context which supports paste
                visible: parameters.isEditable && parameters.editFlags.canPaste,
                role: 'pasteAndMatchStyle',
                accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AND_MATCH_STYLE,
                label: (0, Localize_1.translate)(preferredLocale, 'desktopApplicationMenu.pasteAndMatchStyle'),
            },
            {
                label: (0, Localize_1.translate)(preferredLocale, 'desktopApplicationMenu.pasteAsPlainText'),
                visible: parameters.isEditable && parameters.editFlags.canPaste && electron_1.clipboard.readText().length > 0,
                accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AS_PLAIN_TEXT,
                click: function () { return pasteAsPlainText(browserWindow); },
            },
        ]; },
    });
}
var disposeContextMenu;
// Send all autoUpdater logs to a log file: ~/Library/Logs/new.expensify.desktop/main.log
// See https://www.npmjs.com/package/electron-log
electron_updater_1.autoUpdater.logger = electron_log_1.default;
electron_updater_1.autoUpdater.logger.transports.file.level = 'info';
// Send all Console logs to a log file: ~/Library/Logs/new.expensify.desktop/main.log
// See https://www.npmjs.com/package/electron-log
Object.assign(console, electron_log_1.default.functions);
// This sets up the command line arguments used to manage the update. When
// the --expected-update-version flag is set, the app will open pre-hidden
// until it detects that it has been upgraded to the correct version.
var EXPECTED_UPDATE_VERSION_FLAG = '--expected-update-version';
var APP_DOMAIN = __DEV__ ? "https://dev.new.expensify.com:".concat(port) : 'app://-';
var expectedUpdateVersion;
process.argv.forEach(function (arg) {
    if (!arg.startsWith("".concat(EXPECTED_UPDATE_VERSION_FLAG, "="))) {
        return;
    }
    expectedUpdateVersion = arg.slice("".concat(EXPECTED_UPDATE_VERSION_FLAG, "=").length);
});
// Add the listeners and variables required to ensure that auto-updating
// happens correctly.
var hasUpdate = false;
var downloadedVersion;
var isSilentUpdating = false;
var isUpdateInProgress = false;
var preferredLocale;
var appProtocol = CONST_1.default.DEEPLINK_BASE_URL.replace('://', '');
var quitAndInstallWithUpdate = function () {
    if (!downloadedVersion) {
        return;
    }
    hasUpdate = true;
    electron_updater_1.autoUpdater.quitAndInstall();
};
var verifyAndInstallLatestVersion = function (browserWindow) {
    if (!browserWindow || browserWindow.isDestroyed()) {
        return;
    }
    // Prevent multiple simultaneous updates
    if (isUpdateInProgress) {
        return;
    }
    isUpdateInProgress = true;
    electron_updater_1.autoUpdater
        .checkForUpdates()
        .then(function (result) {
        if (!browserWindow || browserWindow.isDestroyed()) {
            isUpdateInProgress = false;
            return;
        }
        if ((result === null || result === void 0 ? void 0 : result.updateInfo.version) === downloadedVersion) {
            return quitAndInstallWithUpdate();
        }
        return electron_updater_1.autoUpdater.downloadUpdate().then(function () {
            return quitAndInstallWithUpdate();
        });
    })
        .catch(function (error) {
        electron_log_1.default.error('Error during update check or download:', error);
    })
        .finally(function () {
        isUpdateInProgress = false;
    });
};
/** Menu Item callback to trigger an update check */
var manuallyCheckForUpdates = function (menuItem, browserWindow) {
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
    electron_updater_1.autoUpdater
        .checkForUpdates()
        .catch(function (error) {
        isSilentUpdating = false;
        return { error: error };
    })
        .then(function (result) {
        var downloadPromise = result && 'downloadPromise' in result ? result.downloadPromise : undefined;
        if (!browserWindow || !preferredLocale) {
            return;
        }
        if (downloadPromise) {
            electron_1.dialog.showMessageBox(browserWindow, {
                type: 'info',
                message: (0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.available.title'),
                detail: (0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.available.message', { isSilentUpdating: isSilentUpdating }),
                buttons: [(0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.available.soundsGood')],
            });
        }
        else if (result && 'error' in result && result.error) {
            electron_1.dialog.showMessageBox(browserWindow, {
                type: 'error',
                message: (0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.error.title'),
                detail: (0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.error.message'),
                buttons: [(0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.notAvailable.okay')],
            });
        }
        else {
            electron_1.dialog.showMessageBox(browserWindow, {
                type: 'info',
                message: (0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.notAvailable.title'),
                detail: (0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.notAvailable.message'),
                buttons: [(0, Localize_1.translate)(preferredLocale, 'checkForUpdatesModal.notAvailable.okay')],
                cancelId: 2,
            });
        }
        // By returning the `downloadPromise` we keep "check for updates" disabled if any updates are being downloaded
        return downloadPromise;
    })
        .finally(function () {
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
var showKeyboardShortcutsPage = function (browserWindow) {
    if (!browserWindow.isVisible()) {
        return;
    }
    browserWindow.webContents.send(ELECTRON_EVENTS_1.default.KEYBOARD_SHORTCUTS_PAGE);
};
/** Actual auto-update listeners */
var electronUpdater = function (browserWindow) { return ({
    init: function () {
        electron_updater_1.autoUpdater.on(ELECTRON_EVENTS_1.default.UPDATE_DOWNLOADED, function (info) {
            var systemMenu = electron_1.Menu.getApplicationMenu();
            var updateMenuItem = systemMenu === null || systemMenu === void 0 ? void 0 : systemMenu.getMenuItemById("update");
            var checkForUpdatesMenuItem = systemMenu === null || systemMenu === void 0 ? void 0 : systemMenu.getMenuItemById("checkForUpdates");
            downloadedVersion = info.version;
            if (updateMenuItem) {
                updateMenuItem.visible = true;
            }
            if (checkForUpdatesMenuItem) {
                checkForUpdatesMenuItem.visible = false;
            }
            if (browserWindow.isVisible() && !isSilentUpdating) {
                browserWindow.webContents.send(ELECTRON_EVENTS_1.default.UPDATE_DOWNLOADED, info.version);
            }
            else {
                verifyAndInstallLatestVersion(browserWindow);
            }
        });
        electron_1.ipcMain.on(ELECTRON_EVENTS_1.default.START_UPDATE, function () {
            verifyAndInstallLatestVersion(browserWindow);
        });
        electron_updater_1.autoUpdater.checkForUpdates();
    },
    update: function () {
        electron_updater_1.autoUpdater.checkForUpdates();
    },
}); };
var localizeMenuItems = function (submenu, updatedLocale) {
    return submenu.map(function (menu) {
        var newMenu = __assign({}, menu);
        if (menu.id) {
            var labelTranslation = (0, Localize_1.translate)(updatedLocale, "desktopApplicationMenu.".concat(menu.id));
            if (labelTranslation) {
                newMenu.label = labelTranslation;
            }
        }
        if (menu.submenu) {
            newMenu.submenu = localizeMenuItems(menu.submenu, updatedLocale);
        }
        return newMenu;
    });
};
var mainWindow = function () {
    var deeplinkUrl;
    var browserWindow;
    var loadURL = __DEV__ ? function (win) { return win.loadURL("https://dev.new.expensify.com:".concat(port)); } : (0, electron_serve_1.default)({ directory: "".concat(__dirname, "/www") });
    // Prod and staging set the icon in the electron-builder config, so only update it here for dev
    if (__DEV__) {
        electron_1.app.dock.setIcon("".concat(__dirname, "/../icon-dev.png"));
        electron_1.app.setName('New Expensify Dev');
    }
    electron_1.app.on('will-finish-launching', function () {
        electron_1.app.on('open-url', function (event, url) {
            event.preventDefault();
            var urlObject = new URL(url);
            deeplinkUrl = "".concat(APP_DOMAIN).concat(urlObject.pathname).concat(urlObject.search).concat(urlObject.hash);
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
    return (electron_1.app
        .whenReady()
        .then(function () {
        /**
         * We only want to register the scheme this way when in dev, since
         * when the app is bundled electron-builder will take care of it.
         */
        if (__DEV__) {
            electron_1.app.setAsDefaultProtocolClient(appProtocol);
        }
        browserWindow = new electron_1.BrowserWindow({
            backgroundColor: '#FAFAFA',
            width: 1200,
            height: 900,
            webPreferences: {
                preload: "".concat(__dirname, "/contextBridge.js"),
                contextIsolation: true,
                sandbox: false,
            },
            titleBarStyle: 'hidden',
        });
        electron_1.ipcMain.handle(ELECTRON_EVENTS_1.default.REQUEST_DEVICE_ID, function () { return (0, node_machine_id_1.machineId)(); });
        electron_1.ipcMain.handle(ELECTRON_EVENTS_1.default.OPEN_LOCATION_SETTING, function () {
            if (process.platform !== 'darwin') {
                // Platform not supported for location settings
                return Promise.resolve(undefined);
            }
            return new Promise(function (resolve, reject) {
                var command = 'open x-apple.systempreferences:com.apple.preference.security?Privacy_Location';
                (0, child_process_1.exec)(command, function (error) {
                    if (error) {
                        console.error('Error opening location settings:', error);
                        reject(error);
                        return;
                    }
                    resolve(undefined);
                });
            });
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
        var webRequest = browserWindow.webContents.session.webRequest;
        var validDestinationFilters = { urls: ['https://*.expensify.com/*'] };
        /* eslint-disable no-param-reassign */
        if (!__DEV__) {
            // Modify the origin and referer for requests sent to our API
            webRequest.onBeforeSendHeaders(validDestinationFilters, function (details, callback) {
                callback({ requestHeaders: details.requestHeaders });
            });
        }
        // Modify access-control-allow-origin header and CSP for the response
        webRequest.onHeadersReceived(validDestinationFilters, function (details, callback) {
            var _a;
            if (details.responseHeaders) {
                details.responseHeaders['access-control-allow-origin'] = [APP_DOMAIN];
            }
            if ((_a = details.responseHeaders) === null || _a === void 0 ? void 0 : _a['content-security-policy']) {
                details.responseHeaders['content-security-policy'] = details.responseHeaders['content-security-policy'].map(function (value) {
                    return value.startsWith('frame-ancestors') ? "".concat(value, " ").concat(APP_DOMAIN) : value;
                });
            }
            callback({ responseHeaders: details.responseHeaders });
        });
        /* eslint-enable */
        // Prod and staging overwrite the app name in the electron-builder config, so only update it here for dev
        if (__DEV__) {
            browserWindow.setTitle('New Expensify');
        }
        var initialMenuTemplate = [
            {
                id: 'mainMenu',
                submenu: [
                    { id: 'about', role: 'about' },
                    {
                        id: 'update',
                        click: function () { return verifyAndInstallLatestVersion(browserWindow); },
                        visible: false,
                    },
                    { id: 'checkForUpdates', click: manuallyCheckForUpdates },
                    {
                        id: 'viewShortcuts',
                        accelerator: 'CmdOrCtrl+J',
                        click: function () {
                            showKeyboardShortcutsPage(browserWindow);
                        },
                    },
                    { type: 'separator' },
                    { id: 'services', role: 'services' },
                    { type: 'separator' },
                    { id: 'hide', role: 'hide' },
                    { id: 'hideOthers', role: 'hideOthers' },
                    { id: 'showAll', role: 'unhide' },
                    { type: 'separator' },
                    { id: 'quit', role: 'quit' },
                ],
            },
            {
                id: 'fileMenu',
                submenu: [{ id: 'closeWindow', role: 'close', accelerator: 'Cmd+w' }],
            },
            {
                id: 'editMenu',
                submenu: [
                    { id: 'undo', role: 'undo' },
                    { id: 'redo', role: 'redo' },
                    { type: 'separator' },
                    { id: 'cut', role: 'cut' },
                    { id: 'copy', role: 'copy' },
                    { id: 'paste', role: 'paste' },
                    {
                        id: 'pasteAndMatchStyle',
                        role: 'pasteAndMatchStyle',
                        accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AND_MATCH_STYLE,
                    },
                    {
                        id: 'pasteAsPlainText',
                        accelerator: DESKTOP_SHORTCUT_ACCELERATOR.PASTE_AS_PLAIN_TEXT,
                        click: function () { return pasteAsPlainText(browserWindow); },
                    },
                    { id: 'delete', role: 'delete' },
                    { id: 'selectAll', role: 'selectAll' },
                    { type: 'separator' },
                    {
                        id: 'speechSubmenu',
                        submenu: [
                            { id: 'startSpeaking', role: 'startSpeaking' },
                            { id: 'stopSpeaking', role: 'stopSpeaking' },
                        ],
                    },
                ],
            },
            {
                id: 'viewMenu',
                submenu: [
                    { id: 'reload', role: 'reload' },
                    { id: 'forceReload', role: 'forceReload' },
                    { id: 'toggleDevTools', role: 'toggleDevTools' },
                    { type: 'separator' },
                    { id: 'resetZoom', role: 'resetZoom' },
                    { id: 'zoomIn', role: 'zoomIn' },
                    { id: 'zoomOut', role: 'zoomOut' },
                    { type: 'separator' },
                    { id: 'togglefullscreen', role: 'togglefullscreen' },
                ],
            },
            {
                id: 'historyMenu',
                submenu: [
                    {
                        id: 'back',
                        accelerator: process.platform === 'darwin' ? 'Cmd+[' : 'Shift+[',
                        click: function () {
                            browserWindow.webContents.navigationHistory.goBack();
                        },
                    },
                    {
                        label: 'backWithKeyShortcut',
                        visible: false,
                        accelerator: process.platform === 'darwin' ? 'Cmd+Left' : 'Shift+Left',
                        click: function () {
                            browserWindow.webContents.navigationHistory.goBack();
                        },
                    },
                    {
                        id: 'forward',
                        accelerator: process.platform === 'darwin' ? 'Cmd+]' : 'Shift+]',
                        click: function () {
                            browserWindow.webContents.navigationHistory.goForward();
                        },
                    },
                    {
                        label: 'forwardWithKeyShortcut',
                        visible: false,
                        accelerator: process.platform === 'darwin' ? 'Cmd+Right' : 'Shift+Right',
                        click: function () {
                            browserWindow.webContents.navigationHistory.goForward();
                        },
                    },
                ],
            },
            {
                id: 'windowMenu',
                role: 'windowMenu',
                submenu: [{ id: 'minimize', role: 'minimize' }, { id: 'zoom', role: 'zoom' }, { type: 'separator' }, { id: 'front', role: 'front' }],
            },
            {
                id: 'helpMenu',
                role: 'help',
                submenu: [
                    {
                        id: 'learnMore',
                        click: function () {
                            electron_1.shell.openExternal(CONST_1.default.MENU_HELP_URLS.LEARN_MORE);
                        },
                    },
                    {
                        id: 'documentation',
                        click: function () {
                            electron_1.shell.openExternal(CONST_1.default.MENU_HELP_URLS.DOCUMENTATION);
                        },
                    },
                    {
                        id: 'communityDiscussions',
                        click: function () {
                            electron_1.shell.openExternal(CONST_1.default.MENU_HELP_URLS.COMMUNITY_DISCUSSIONS);
                        },
                    },
                    {
                        id: 'searchIssues',
                        click: function () {
                            electron_1.shell.openExternal(CONST_1.default.MENU_HELP_URLS.SEARCH_ISSUES);
                        },
                    },
                ],
            },
        ];
        // When the user clicks a link that has target="_blank" (which is all external links)
        // open the default browser instead of a new electron window
        browserWindow.webContents.setWindowOpenHandler(function (_a) {
            var url = _a.url;
            var denial = { action: 'deny' };
            // Make sure local urls stay in electron perimeter
            if (url.slice(0, 'file://'.length).toLowerCase() === 'file://') {
                return denial;
            }
            // Open every other protocol in the default browser, not Electron
            electron_1.shell.openExternal(url);
            return denial;
        });
        // Flag to determine is user is trying to quit the whole application altogether
        var quitting = false;
        // Closing the chat window should just hide it (vs. fully quitting the application)
        browserWindow.on('close', function (evt) {
            if (quitting || hasUpdate) {
                return;
            }
            evt.preventDefault();
            // Check if window is fullscreen and exit fullscreen before hiding
            if (browserWindow.isFullScreen()) {
                browserWindow.once('leave-full-screen', function () { return browserWindow.hide(); });
                browserWindow.setFullScreen(false);
            }
            else {
                browserWindow.hide();
            }
        });
        // Initiating a browser-back or browser-forward with mouse buttons should navigate history.
        browserWindow.on('app-command', function (e, cmd) {
            if (cmd === 'browser-backward') {
                browserWindow.webContents.navigationHistory.goBack();
            }
            if (cmd === 'browser-forward') {
                browserWindow.webContents.navigationHistory.goForward();
            }
        });
        browserWindow.on('swipe', function (e, direction) {
            if (direction === 'left') {
                browserWindow.webContents.navigationHistory.goBack();
            }
            if (direction === 'right') {
                browserWindow.webContents.navigationHistory.goForward();
            }
        });
        browserWindow.on(ELECTRON_EVENTS_1.default.FOCUS, function () {
            browserWindow.webContents.send(ELECTRON_EVENTS_1.default.FOCUS);
        });
        browserWindow.on(ELECTRON_EVENTS_1.default.BLUR, function () {
            browserWindow.webContents.send(ELECTRON_EVENTS_1.default.BLUR);
        });
        // Handle renderer process crashes by relaunching the app
        browserWindow.webContents.on('render-process-gone', function (event, detailed) {
            if (detailed.reason === 'crashed') {
                // relaunch app
                electron_1.app.relaunch({ args: process.argv.slice(1).concat(['--relaunch']) });
                electron_1.app.exit(0);
            }
            Log_1.default.info('App crashed  render-process-gone');
            Log_1.default.info(JSON.stringify(detailed));
        });
        electron_1.app.on('before-quit', function () {
            // Adding __DEV__ check because we want links to be handled by dev app only while it's running
            // https://github.com/Expensify/App/issues/15965#issuecomment-1483182952
            if (__DEV__) {
                electron_1.app.removeAsDefaultProtocolClient(appProtocol);
            }
            // Clean up update listeners and reset flags
            electron_updater_1.autoUpdater.removeAllListeners();
            isUpdateInProgress = false;
            isSilentUpdating = false;
            quitting = true;
        });
        electron_1.app.on('activate', function () {
            if (expectedUpdateVersion && electron_1.app.getVersion() !== expectedUpdateVersion) {
                return;
            }
            browserWindow.show();
        });
        // Hide the app if we expected to upgrade to a new version but never did.
        if (expectedUpdateVersion && electron_1.app.getVersion() !== expectedUpdateVersion) {
            browserWindow.hide();
            electron_1.app.hide();
        }
        // Note that we have to subscribe to this separately since we cannot listen to Onyx.connect here,
        // because the only way code can be shared between the main and renderer processes at runtime is via the context bridge
        // So we track preferredLocale separately via ELECTRON_EVENTS.LOCALE_UPDATED
        electron_1.ipcMain.on(ELECTRON_EVENTS_1.default.LOCALE_UPDATED, function (event, updatedLocale) {
            IntlStore_1.default.load(updatedLocale).then(function () {
                preferredLocale = updatedLocale;
                electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(localizeMenuItems(initialMenuTemplate, updatedLocale)));
                disposeContextMenu === null || disposeContextMenu === void 0 ? void 0 : disposeContextMenu();
                disposeContextMenu = createContextMenu(updatedLocale);
            });
        });
        electron_1.ipcMain.on(ELECTRON_EVENTS_1.default.REQUEST_VISIBILITY, function (event) {
            // This is how synchronous messages work in Electron
            // eslint-disable-next-line no-param-reassign
            event.returnValue = browserWindow && !browserWindow.isDestroyed() && browserWindow.isFocused();
        });
        // This allows the renderer process to bring the app
        // back into focus if it's minimized or hidden.
        electron_1.ipcMain.on(ELECTRON_EVENTS_1.default.REQUEST_FOCUS_APP, function () {
            browserWindow.show();
        });
        // Listen to badge updater event emitted by the render process
        // and update the app badge count (MacOS only)
        electron_1.ipcMain.on(ELECTRON_EVENTS_1.default.REQUEST_UPDATE_BADGE_COUNT, function (event, totalCount) {
            if (totalCount === -1) {
                // The electron docs say you should be able to update this and pass no parameters to set the badge
                // to a single red dot, but in practice it resulted in an error "TypeError: Insufficient number of
                // arguments." - Thus, setting to 1 instead.
                // See: https://www.electronjs.org/docs/api/app#appsetbadgecountcount-linux-macos
                electron_1.app.setBadgeCount(1);
            }
            else {
                electron_1.app.setBadgeCount(totalCount);
            }
        });
        var downloadQueue = createDownloadQueue();
        electron_1.ipcMain.on(ELECTRON_EVENTS_1.default.DOWNLOAD, function (event, downloadData) {
            var downloadItem = __assign(__assign({}, downloadData), { win: browserWindow });
            downloadQueue.enqueueDownloadItem(downloadItem);
        });
        // Automatically check for and install the latest version in the background
        electron_1.ipcMain.on(ELECTRON_EVENTS_1.default.SILENT_UPDATE, function () {
            if (isSilentUpdating) {
                return;
            }
            isSilentUpdating = true;
            manuallyCheckForUpdates(undefined, browserWindow);
        });
        return browserWindow;
    })
        // After initializing and configuring the browser window, load the compiled JavaScript
        .then(function (browserWindowRef) {
        loadURL(browserWindow).then(function () {
            if (!deeplinkUrl) {
                return;
            }
            browserWindow.loadURL(deeplinkUrl);
            browserWindow.show();
        });
        return browserWindowRef;
    })
        // Start checking for JS updates
        .then(function (browserWindowRef) {
        if (__DEV__) {
            return;
        }
        (0, checkForUpdates_1.default)(electronUpdater(browserWindowRef));
    }));
};
mainWindow().then(function (window) { return window; });
