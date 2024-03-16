import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import type {Options} from '@desktop/electronDownloadManagerType';
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

    return new Promise((resolve) => {
        window.electron.on(ELECTRON_EVENTS.DOWNLOAD_STARTED, (...args: unknown[]) => {
            if (!Array.isArray(args) || args[0] === null || typeof args[0] !== 'object' || !('url' in args[0])) {
                return;
            }

            const {url: eventUrl} = args[0] as {url: string};

            if (eventUrl !== url) {
                return;
            }

            resolve();
        });
    });
};

export default fileDownload;
