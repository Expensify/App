import type {BrowserWindow} from 'electron';
import type {Options} from './electronDownloadManager';
import {download as electronDownload} from './electronDownloadManager';

type DownloadItem = {
    win: BrowserWindow;
    url: string;
    options: Options;
};

type DownloadQueue = DownloadItem[];

const createDownloadQueue = () => {
    const queue: DownloadQueue = [];

    const processQueue = (): void => {
        const item = queue.shift();
        if (!item) {
            return;
        }

        const newItem = {
            ...item,
            options: {
                ...item.options,
                onCompleted: processQueue,
                onCancel: processQueue,
            },
        };

        electronDownload(newItem.win, newItem.url, newItem.options);
    };

    const pushDownloadItem = (item: DownloadItem): number => {
        const len = queue.push(item);
        if (queue.length === 1) {
            processQueue();
        }
        return len;
    };

    return {pushDownloadItem};
};

export default createDownloadQueue;
