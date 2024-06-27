import type {BrowserWindow} from 'electron';
import {app} from 'electron';
import * as path from 'path';
import createQueue from '@libs/Queue/Queue';
import CONST from '@src/CONST';
import ELECTRON_EVENTS from './ELECTRON_EVENTS';
import type Options from './electronDownloadManagerType';

type DownloadItem = {
    // The window where the download will be initiated
    win: BrowserWindow;

    // The URL of the file to be downloaded
    url: string;

    // The options for the download, such as save path, file name, etc.
    options: Options;
};

type CreateDownloadQueue = () => {
    enqueueDownloadItem: (item: DownloadItem) => void;
    dequeueDownloadItem: () => DownloadItem | undefined;
};

type CreateDownloadQueueModule = {
    default: CreateDownloadQueue;
};

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

const createDownloadQueue: CreateDownloadQueue = () => {
    const downloadItemProcessor = (item: DownloadItem): Promise<void> =>
        new Promise((resolve, reject) => {
            let downloadTimeout: NodeJS.Timeout;
            let downloadListener: (event: Electron.Event, electronDownloadItem: Electron.DownloadItem) => void;

            const timeoutFunction = () => {
                item.win.webContents.session.removeListener('will-download', downloadListener);
                resolve();
            };

            const listenerFunction = (event: Electron.Event, electronDownloadItem: Electron.DownloadItem) => {
                clearTimeout(downloadTimeout);

                const options = item.options;
                const cleanup = () => item.win.webContents.session.removeListener('will-download', listenerFunction);
                const errorMessage = `The download of ${electronDownloadItem.getFilename()} was interrupted`;

                if (options.directory && !path.isAbsolute(options.directory)) {
                    throw new Error('The `directory` option must be an absolute path');
                }

                const directory = options.directory ?? app.getPath('downloads');

                let filePath: string;
                if (options.filename) {
                    filePath = path.join(directory, options.filename);
                } else {
                    const filename = electronDownloadItem.getFilename();
                    const name = path.extname(filename) ? filename : getFilenameFromMime(filename, electronDownloadItem.getMimeType());

                    filePath = options.overwrite ? path.join(directory, name) : path.join(directory, name);
                }

                if (options.saveAs) {
                    electronDownloadItem.setSaveDialogOptions({defaultPath: filePath, ...options.dialogOptions});
                } else {
                    electronDownloadItem.setSavePath(filePath);
                }

                electronDownloadItem.on('updated', (_, state) => {
                    if (state !== 'interrupted') {
                        return;
                    }

                    item.win.webContents.send(ELECTRON_EVENTS.DOWNLOAD_CANCELED, {url: item.url});
                    cleanup();
                    reject(new Error(errorMessage));
                    electronDownloadItem.cancel();
                });

                electronDownloadItem.on('done', (_, state) => {
                    cleanup();
                    if (state === 'cancelled') {
                        item.win.webContents.send(ELECTRON_EVENTS.DOWNLOAD_CANCELED, {url: item.url});
                        resolve();
                    } else if (state === 'interrupted') {
                        item.win.webContents.send(ELECTRON_EVENTS.DOWNLOAD_FAILED, {url: item.url});
                        reject(new Error(errorMessage));
                    } else if (state === 'completed') {
                        if (process.platform === 'darwin') {
                            const savePath = electronDownloadItem.getSavePath();
                            app.dock.downloadFinished(savePath);
                        }
                        item.win.webContents.send(ELECTRON_EVENTS.DOWNLOAD_COMPLETED, {url: item.url});
                        resolve();
                    }
                });
            };

            downloadTimeout = setTimeout(timeoutFunction, CONST.DOWNLOADS_TIMEOUT);
            downloadListener = listenerFunction;

            item.win.webContents.downloadURL(item.url);
            item.win.webContents.session.on('will-download', downloadListener);
        });

    const queue = createQueue<DownloadItem>(downloadItemProcessor);

    const enqueueDownloadItem = (item: DownloadItem): void => {
        queue.enqueue(item);
    };
    return {enqueueDownloadItem, dequeueDownloadItem: queue.dequeue};
};

export default createDownloadQueue;
export type {DownloadItem, CreateDownloadQueueModule};
