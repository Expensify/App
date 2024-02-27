import type {Options} from '@libs/downloadQueue/electronDownloadManagerType';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';
import type {FileDownload} from './types';

/**
 * The function downloads an attachment on desktop platforms.
 */
const fileDownload: FileDownload = (url, fileName) => {
    const options: Options = {
        filename: fileName,
        saveAs: true,
    };
    window.electron.send(ELECTRON_EVENTS.DOWNLOAD, {url, options});

    /**
     * Adds a 1000ms delay to keep showing the loading spinner
     * and prevent rapid clicks on the same download link.
     */
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, 1000);
    });
};

export default fileDownload;
