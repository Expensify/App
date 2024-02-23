import type {DownloadItem, Event, SaveDialogOptions, Session, WebContents} from 'electron';
import {app, BrowserWindow, dialog, shell} from 'electron';
import * as path from 'path';

/**
 * This file is a ported version of the `electron-dl` package.
 * It provides a download manager for Electron applications.
 * The `electron-dl` package simplifies the process of downloading files in Electron apps
 * by providing a high-level API and handling various download-related tasks.
 * This file contains the implementation of the Electron Download Manager.
 */

class CancelError extends Error {}

const getFilenameFromMime = (name: string, mime: string): string => {
    const extensions = mime.split('/').pop();
    return `${name}.${extensions}`;
};

const majorElectronVersion = (): number => {
    const version = process.versions.electron.split('.');
    return Number.parseInt(version[0], 10);
};

const getWindowFromBrowserView = (webContents: WebContents): BrowserWindow | undefined => {
    for (const currentWindow of BrowserWindow.getAllWindows()) {
        for (const currentBrowserView of currentWindow.getBrowserViews()) {
            if (currentBrowserView.webContents.id === webContents.id) {
                return currentWindow;
            }
        }
    }
};

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

type Options = {
    showBadge?: boolean;
    showProgressBar?: boolean;
    directory?: string;
    filename?: string;
    overwrite?: boolean;
    errorMessage?: string;
    saveAs?: boolean;
    dialogOptions?: SaveDialogOptions;
    onProgress?: (progress: {percent: number; transferredBytes: number; totalBytes: number}) => void;
    onTotalProgress?: (progress: {percent: number; transferredBytes: number; totalBytes: number}) => void;
    onCancel?: (item: DownloadItem) => void;
    onCompleted?: (info: {fileName: string; filename: string; path: string; fileSize: number; mimeType: string; url: string}) => void;
    unregisterWhenDone?: boolean;
    openFolderWhenDone?: boolean;
    onStarted?: (item: DownloadItem) => void;
};

const registerListener = (session: Session, prevOptions: Options, callback: (error: Error | null, item?: DownloadItem) => void = () => {}): void => {
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
            item.setSaveDialogOptions({defaultPath: filePath, ...options.dialogOptions});
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
                        fileName: item.getFilename(), // Just for backwards compatibility. TODO: Remove in the next major version.
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
const download = (electronWindow: BrowserWindow, url: string, prevOptions: Options): Promise<DownloadItem> => {
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

export {download};
export type {CancelError, Options};
