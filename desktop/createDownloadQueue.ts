import type {BrowserWindow} from 'electron';
import createQueue from '@libs/Queue/Queue';
import ELECTRON_EVENTS from './ELECTRON_EVENTS';
import electronDownload from './electronDownloadManager';
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
    const downloadItem = (item: DownloadItem): Promise<void> =>
        new Promise((resolve) => {
            const options = {
                ...item.options,
                onStarted: () => {
                    item.win.webContents.send(ELECTRON_EVENTS.DOWNLOAD_STARTED, {url: item.url});
                },
                onCompleted: () => resolve(),
                onCancel: () => resolve(),
            };

            electronDownload(item.win, item.url, options);
        });

    const queue = createQueue<DownloadItem>(downloadItem);

    const enqueueDownloadItem = (item: DownloadItem): void => {
        queue.enqueue(item);
    };
    return {enqueueDownloadItem, dequeueDownloadItem: queue.dequeue};
};

export default createDownloadQueue;
