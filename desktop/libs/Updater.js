const {Menu, ipcMain} = require('electron');
const {autoUpdater} = require('electron-updater');
const ELECTRON_EVENTS = require('../ELECTRON_EVENTS');

ipcMain.on(ELECTRON_EVENTS.INIT_UPDATER, (browserWindow) => {
    autoUpdater.on(ELECTRON_EVENTS.UPDATE_DOWNLOADED, (info) => {
        const systemMenu = Menu.getApplicationMenu();
        const downloadedVersion = info.version;
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
});
