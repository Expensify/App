/**
 * This file is a replicated version of the `electron-dl` package.
 * It provides a download manager for Electron applications.
 * The package simplifies the process of downloading files in Electron apps
 * by providing a high-level API and handling various download-related tasks.
 * We decided to replicate the functionality of the `electron-dl` package for easier maintenance.
 * More context: https://github.com/Expensify/App/issues/35189#issuecomment-1959681109
 */
import type {BrowserView, BrowserWindow, DownloadItem, Event, Session} from 'electron';
import {app, shell} from 'electron';
import * as path from 'path';
import type {Options} from './electronDownloadManagerType';

/**
Error thrown if `item.cancel()` was called.
*/
declare class CancelError extends Error {}

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
 * Registers a listener for download events in Electron session.
 *
 * @param session - The Electron session to register the listener on.
 * @param options - The previous options for the download manager.
 * @param callback - The callback function to be called when a download event occurs.
 */
const registerListener = (session: Session, options: Options, callback: (error: Error | null, item?: DownloadItem) => void = () => {}): void => {
    const downloadItems = new Set<DownloadItem>();
    const listener = (event: Event, item: DownloadItem): void => {
        downloadItems.add(item);

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
            item.setSaveDialogOptions({defaultPath: filePath, ...options.dialogOptions});
        } else {
            item.setSavePath(filePath);
        }

        item.on('done', (doneEvent: Event, state: string) => {
            downloadItems.delete(item);

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
    };

    session.on('will-download', listener);
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
import electronDownloadManager = require('./electronDownloadManager');

ipcMain.on('download-button', async (event, {url}) => {
    const win = BrowserWindow.getFocusedWindow();
    console.log(await electronDownloadManager.download(win, url));
});
```
*/
const download = (electronWindow: BrowserWindow | BrowserView, url: string, prevOptions?: Options): Promise<DownloadItem> => {
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

export default download;
