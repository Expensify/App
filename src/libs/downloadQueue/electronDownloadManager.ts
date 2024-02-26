/**
 * This file is a ported version of the `electron-dl` package.
 * It provides a download manager for Electron applications.
 * The `electron-dl` package simplifies the process of downloading files in Electron apps
 * by providing a high-level API and handling various download-related tasks.
 * This file contains the implementation of the Electron Download Manager.
 */

import type { DownloadItem, Event, Session, WebContents, BrowserView } from 'electron';
import { app, BrowserWindow, dialog, shell } from 'electron';
import * as path from 'path';
import { Options } from './electronDownloadManagerType';

/**
Error thrown if `item.cancel()` was called.
*/
declare class CancelError extends Error { }

/**
 * Returns the filename with extension based on the given name and MIME type.
 * @param name - The name of the file.
 * @param mime - The MIME type of the file.
 * @returns The filename with extension.
 */
const getFilenameFromMime = (name: string, mime: string): string => {
    const extensions = mime.split('/').pop();
    return `${name}.${extensions}`;
};

/**
 * Returns the major version number of Electron.
 * @returns The major version number of Electron.
 */
const majorElectronVersion = (): number => {
    const version = process.versions.electron.split('.');
    return Number.parseInt(version[0], 10);
};

/**
 * Retrieves the parent BrowserWindow associated with the given WebContents.
 * @param webContents The WebContents object to find the parent BrowserWindow for.
 * @returns The parent BrowserWindow if found, otherwise undefined.
 */
const getWindowFromBrowserView = (webContents: WebContents): BrowserWindow | undefined => {
    for (const currentWindow of BrowserWindow.getAllWindows()) {
        for (const currentBrowserView of currentWindow.getBrowserViews()) {
            if (currentBrowserView.webContents.id === webContents.id) {
                return currentWindow;
            }
        }
    }
};

/**
 * Retrieves the Electron BrowserWindow associated with the given WebContents.
 * @param webContents The WebContents object to retrieve the BrowserWindow from.
 * @returns The associated BrowserWindow, or undefined if not found.
 */
const getWindowFromWebContents = (webContents: WebContents): BrowserWindow | undefined | null => {
    let electronWindow: BrowserWindow | undefined | null;
    const webContentsType = webContents.getType();
    switch (webContentsType) {
        case 'webview':
            electronWindow = BrowserWindow.fromWebContents(webContents.hostWebContents);
            break;
        case 'browserView':
            electronWindow = getWindowFromBrowserView(webContents);
            break;
        default:
            electronWindow = BrowserWindow.fromWebContents(webContents);
            break;
    }

    return electronWindow;
};

/**
 * Registers a listener for download events in Electron session.
 * 
 * @param session - The Electron session to register the listener on.
 * @param prevOptions - The previous options for the download manager.
 * @param callback - The callback function to be called when a download event occurs.
 */
const registerListener = (session: Session, prevOptions: Options, callback: (error: Error | null, item?: DownloadItem) => void = () => { }): void => {
    const downloadItems = new Set<DownloadItem>();
    let receivedBytes = 0;
    let completedBytes = 0;
    let totalBytes = 0;
    const activeDownloadItems = (): number => downloadItems.size;
    const progressDownloadItems = (): number => receivedBytes / totalBytes;

    const options = {
        showBadge: true,
        showProgressBar: true,
        ...prevOptions,
    };

    const listener = (event: Event, item: DownloadItem, webContents: WebContents): void => {
        downloadItems.add(item);
        totalBytes += item.getTotalBytes();

        const electronWindow = majorElectronVersion() >= 12 ? BrowserWindow.fromWebContents(webContents) : getWindowFromWebContents(webContents);

        if (options.directory && !path.isAbsolute(options.directory)) {
            throw new Error('The `directory` option must be an absolute path');
        }

        const directory = options.directory ?? app.getPath('downloads');

        let filePath: string;
        if (options.filename) {
            filePath = path.join(directory, options.filename);
        } else {
            const filename = item.getFilename();
            const name = path.extname(filename) ? filename : getFilenameFromMime(filename, item.getMimeType());

            filePath = options.overwrite ? path.join(directory, name) : path.join(directory, name);
        }

        if (options.saveAs) {
            item.setSaveDialogOptions({ defaultPath: filePath, ...options.dialogOptions });
        } else {
            item.setSavePath(filePath);
        }

        item.on('updated', () => {
            receivedBytes = completedBytes;
            for (const downloadItem of downloadItems) {
                receivedBytes += downloadItem.getReceivedBytes();
            }

            if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
                app.badgeCount = activeDownloadItems();
            }

            if (!electronWindow?.isDestroyed() && options.showProgressBar) {
                electronWindow?.setProgressBar(progressDownloadItems());
            }

            if (typeof options.onProgress === 'function') {
                const itemTransferredBytes = item.getReceivedBytes();
                const itemTotalBytes = item.getTotalBytes();

                options.onProgress({
                    percent: itemTotalBytes ? itemTransferredBytes / itemTotalBytes : 0,
                    transferredBytes: itemTransferredBytes,
                    totalBytes: itemTotalBytes,
                });
            }

            if (typeof options.onTotalProgress === 'function') {
                options.onTotalProgress({
                    percent: progressDownloadItems(),
                    transferredBytes: receivedBytes,
                    totalBytes,
                });
            }
        });

        item.on('done', (doneEvent: Event, state: string) => {
            completedBytes += item.getTotalBytes();
            downloadItems.delete(item);

            if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
                app.badgeCount = activeDownloadItems();
            }

            if (!electronWindow?.isDestroyed() && !activeDownloadItems()) {
                electronWindow?.setProgressBar(-1);
                receivedBytes = 0;
                completedBytes = 0;
                totalBytes = 0;
            }

            if (options.unregisterWhenDone) {
                session.removeListener('will-download', listener);
            }

            if (state === 'cancelled') {
                if (typeof options.onCancel === 'function') {
                    options.onCancel(item);
                }
                callback(new CancelError());
            } else if (state === 'interrupted') {
                const errorMessage = `The download of ${path.basename(filePath)} was interrupted`;

                callback(new Error(errorMessage));
            } else if (state === 'completed') {
                const savePath = item.getSavePath();

                if (process.platform === 'darwin') {
                    app.dock.downloadFinished(savePath);
                }

                if (options.openFolderWhenDone) {
                    shell.showItemInFolder(savePath);
                }

                if (typeof options.onCompleted === 'function') {
                    options.onCompleted({
                        filename: item.getFilename(),
                        path: savePath,
                        fileSize: item.getReceivedBytes(),
                        mimeType: item.getMimeType(),
                        url: item.getURL(),
                    });
                }

                callback(null, item);
            }
        });

        if (typeof options.onStarted === 'function') {
            options.onStarted(item);
        }
    };

    session.on('will-download', listener);
};

/**
Register the helper for all windows.

@example
```
import {app, BrowserWindow} from 'electron';
import electronDownloadManager = require('electron-dl');

electronDownloadManager();

let win;
(async () => {
    await app.whenReady();
    win = new BrowserWindow();
})();
```
*/
export default (options: Options = {}): void => {
    app.on('session-created', (session: Session) => {
        registerListener(session, options, (error: Error | null) => {
            if (!error || error instanceof CancelError) {
                return;
            }

            const errorTitle = options.errorMessage ?? 'Download Error';
            dialog.showErrorBox(errorTitle, error.message);
        });
    });
};

/**
This can be useful if you need download functionality in a reusable module.

@param window - Window to register the behavior on.
@param url - URL to download.
@returns A promise for the downloaded file.
@throws {CancelError} An error if the user calls `item.cancel()`.
@throws {Error} An error if the download fails.

@example
```
import {BrowserWindow, ipcMain} from 'electron';
import electronDownloadManager = require('electron-dl');

ipcMain.on('download-button', async (event, {url}) => {
    const win = BrowserWindow.getFocusedWindow();
    console.log(await electronDownloadManager.download(win, url));
});
```
*/

const download = (
    electronWindow: BrowserWindow | BrowserView,
    url: string,
    prevOptions?: Options
): Promise<DownloadItem> => {
    const options = {
        ...prevOptions,
        unregisterWhenDone: true,
    };

    return new Promise((resolve, reject) => {
        registerListener(electronWindow.webContents.session, options, (error: Error | null, item?: DownloadItem) => {
            if (error) {
                reject(error);
            } else if (item) {
                resolve(item);
            } else {
                reject(new Error('Download item is undefined.'));
            }
        });

        electronWindow.webContents.downloadURL(url);
    });
};

export { download };
export type { CancelError, Options };
