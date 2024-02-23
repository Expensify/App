import { download as electronDownload } from '@libs/downloadQueue/electronDownloadManager';

interface DownloadItem {
  win: any;
  url: string;
  options: Electron.Options
}

type DownloadQueue = DownloadItem[];

const createDownloadQueue = () => {
  const queue: DownloadQueue = [];

  const pushDownloadItem = (item: DownloadItem): number => {
    const len = queue.push(item);
    if (queue.length === 1) {
      downloadItem(queue[0]);
    }
    return len;
  };

  const shiftDownloadItem = (): DownloadItem | undefined => {
    const item = queue.shift();
    if (queue.length > 0) {
      downloadItem(queue[0]);
    }
    return item;
  };

  const downloadItem = (item: DownloadItem): void => {
    item.options.onCompleted = () => {
      shiftDownloadItem();
    };

    item.options.onCancel = item.options.onCompleted;

    electronDownload(item.win, item.url, item.options);
  };

  return { pushDownloadItem, shiftDownloadItem };
};

export default createDownloadQueue;