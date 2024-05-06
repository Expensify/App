import type {BrowserWindow} from 'electron';
import {app} from 'electron';
import createQueue from '@libs/Queue/Queue';
import ELECTRON_EVENTS from './ELECTRON_EVENTS';
import type {Options} from './electronDownloadManagerType';

type DownloadItem = {
    // The window where the download will be initiated
    win: BrowserWindow;

    // The URL of the file to be downloaded
    url: string;

    // The options for the download, such as save path, file name, etc.
    options: Options;
};

const createDownloadQueue = () => {
    const downloadItemProcessor = (item: DownloadItem): Promise<void> =>
        new Promise((resolve, reject) => {
            item.win.webContents.downloadURL(item.url);

            const listener = (event: Electron.Event, downloadItem: Electron.DownloadItem) => {
                const cleanup = () => item.win.webContents.session.removeListener('will-download', listener);
                const errorMessage = `The download of ${downloadItem.getFilename()} was interrupted`;

                downloadItem.on('updated', (_, state) => {
                    if (state !== 'interrupted') {
                        return;
                    }

                    cleanup();
                    reject(new Error(errorMessage));
                    downloadItem.cancel();
                });

                downloadItem.on('done', (_, state) => {
                    cleanup();
                    if (state === 'cancelled') {
                        resolve();
                    } else if (state === 'interrupted') {
                        reject(new Error(errorMessage));
                    } else if (state === 'completed') {
                        if (process.platform === 'darwin') {
                            const savePath = downloadItem.getSavePath();
                            app.dock.downloadFinished(savePath);
                        }
                        resolve();
                    }
                });

                item.win.webContents.send(ELECTRON_EVENTS.DOWNLOAD_STARTED, {url: item.url});
            };

            item.win.webContents.session.on('will-download', listener);
        });

    const queue = createQueue<DownloadItem>(downloadItemProcessor);

    const enqueueDownloadItem = (item: DownloadItem): void => {
        queue.enqueue(item);
    };
    return {enqueueDownloadItem, dequeueDownloadItem: queue.dequeue};
};

export default createDownloadQueue;
