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

/**
 * Creates a download queue.
 * @returns An object with methods to enqueue and dequeue download items from the queue.
 */
const createDownloadQueue = () => {
    let queue: ReturnType<typeof createQueue<DownloadItem>>;

    const downloadItem = (item: DownloadItem): void => {
        const newItem = {
            ...item,
            options: {
                ...item.options,
                onStarted: () => {
                    item.win.webContents.send(ELECTRON_EVENTS.DOWNLOAD_STARTED, {url: item.url});
                },
                onCompleted: queue.processNextItem,
                onCancel: queue.processNextItem,
            },
        };

        electronDownload(newItem.win, newItem.url, newItem.options);
    };

    queue = createQueue<DownloadItem>(downloadItem);

    /**
     * Enqueues a download item to the queue and returns the new length of the queue.
     * If the queue was empty before enqueuing the item, it will immediately start downloading the item.
     * @param item The download item to be enqueued to the queue.
     * @returns The new length of the queue after enqueuing the item.
     */
    const enqueueDownloadItem = (item: DownloadItem): number => {
        queue.enqueue(item);
        if (queue.size() === 1) {
            downloadItem(item);
        }
        return queue.size();
    };
    return {enqueueDownloadItem, dequeueDownloadItem: queue.dequeue};
};

export default createDownloadQueue;
