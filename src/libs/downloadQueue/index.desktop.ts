import type {BrowserWindow} from 'electron';
import {download as electronDownload} from './electronDownloadManager';
import type {Options} from './electronDownloadManagerType';

type DownloadItem = {
    win: BrowserWindow;
    url: string;
    options: Options;
};

type DownloadQueue = DownloadItem[];
const createDownloadQueue = () => {
    const queue: DownloadQueue = [];

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
