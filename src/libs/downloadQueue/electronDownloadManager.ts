import type { DownloadItem, Session, SaveDialogOptions, WebContents, Event } from 'electron';
import { app, BrowserWindow, dialog, shell } from 'electron';
import * as path from 'path';
import * as _ from 'underscore';

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
    let window_: BrowserWindow | undefined | null;
    const webContentsType = webContents.getType();
    switch (webContentsType) {
        case 'webview':
            window_ = BrowserWindow.fromWebContents(webContents.hostWebContents);
            break;
        case 'browserView':
            window_ = getWindowFromBrowserView(webContents);
            break;
        default:
            window_ = BrowserWindow.fromWebContents(webContents);
            break;
    }

    return window_;
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
}

const registerListener = (session: Session, options: Options, callback: (error: Error | null, item?: DownloadItem) => void = () => {}): void => {
    const downloadItems = new Set<DownloadItem>();
    let receivedBytes = 0;
    let completedBytes = 0;
    let totalBytes = 0;
    const activeDownloadItems = (): number => downloadItems.size;
    const progressDownloadItems = (): number => receivedBytes / totalBytes;

    options = {
        showBadge: true,
        showProgressBar: true,
        ...options,
    };

    const listener = (event: Event, item: DownloadItem, webContents: WebContents): void => {
        downloadItems.add(item);
        totalBytes += item.getTotalBytes();

        const window_ = majorElectronVersion() >= 12 ? BrowserWindow.fromWebContents(webContents) : getWindowFromWebContents(webContents);

        if (options.directory && !path.isAbsolute(options.directory)) {
            throw new Error('The `directory` option must be an absolute path');
        }

        const directory = options.directory || app.getPath('downloads');

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
            for (const item of downloadItems) {
                receivedBytes += item.getReceivedBytes();
            }

            if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
                app.badgeCount = activeDownloadItems();
            }

            if (!window_?.isDestroyed() && options.showProgressBar) {
                window_?.setProgressBar(progressDownloadItems());
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

        item.on('done', (event: Event, state: string) => {
            completedBytes += item.getTotalBytes();
            downloadItems.delete(item);

            if (options.showBadge && ['darwin', 'linux'].includes(process.platform)) {
                app.badgeCount = activeDownloadItems();
            }

            if (!window_?.isDestroyed() && !activeDownloadItems()) {
                window_?.setProgressBar(-1);
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

export default (options: any = {}): void => {
    app.on('session-created', (session: Session) => {
        registerListener(session, options, (error: Error | null, _) => {
            if (error && !(error instanceof CancelError)) {
                const errorTitle = options.errorTitle || 'Download Error';
                dialog.showErrorBox(errorTitle, error.message);
            }
        });
    });
};

export const download = (window_: BrowserWindow, url: string, options: Options): Promise<DownloadItem> => {
    options = {
        ...options,
        unregisterWhenDone: true,
    };

    return new Promise((resolve, reject) => {
        registerListener(window_.webContents.session, options, (error: Error | null, item?: DownloadItem) => {
            if (error) {
                reject(error);
            } else if (item) {
                resolve(item);
            } else {
                reject(new Error('Download item is undefined.'));
            }
        });

        window_.webContents.downloadURL(url);
    });
};

export type {CancelError, Options};
