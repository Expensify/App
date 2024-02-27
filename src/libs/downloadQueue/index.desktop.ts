import type {BrowserWindow} from 'electron';
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
 * Represents a queue of download items.
 */
type DownloadQueue = DownloadItem[];

/**
 * Creates a download queue.
 * @returns An object with methods to push and shift download items from the queue.
 */
const createDownloadQueue = () => {
    const queue: DownloadQueue = [];

    /**
     * Shifts and returns the first item from the download queue.
     * If the queue is not empty, it triggers the download of the next item.
     * @returns The shifted DownloadItem or undefined if the queue is empty.
     */
    const shiftDownloadItem = (): DownloadItem | undefined => {
        const item = queue.shift();
        if (queue.length > 0) {
            // This code block contains a cyclic dependency between functions,
            // so one of them should have the eslint-disable-next-line comment
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            downloadItem(queue[0]);
        }
        return item;
    };

    /**
     * Downloads the specified item.
     * @param item - The item to be downloaded.
     */
    const downloadItem = (item: DownloadItem): void => {
        const newItem = {
            ...item,
            options: {
                ...item.options,
                onCompleted: () => {
                    shiftDownloadItem();
                },
                onCancel: () => {
                    shiftDownloadItem();
                },
            },
        };

        electronDownload(newItem.win, newItem.url, newItem.options);
    };

    /**
     * Pushes a download item to the queue and returns the new length of the queue.
     * If the queue was empty before pushing the item, it will immediately start downloading the item.
     * @param item The download item to be pushed to the queue.
     * @returns The new length of the queue after pushing the item.
     */
    const pushDownloadItem = (item: DownloadItem): number => {
        const len = queue.push(item);
        if (queue.length === 1) {
            downloadItem(queue[0]);
        }
        return len;
    };

    return {pushDownloadItem, shiftDownloadItem};
};

export default createDownloadQueue;
