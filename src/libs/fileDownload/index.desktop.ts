import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import type {Options} from '@desktop/electronDownloadManagerType';
import CONST from '@src/CONST';
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
        // This sets a timeout that will resolve the promise after 5 seconds to prevent indefinite hanging
        const downloadTimeout = setTimeout(() => {
            resolve();
        }, CONST.DOWNLOADS_TIMEOUT);

        window.electron.on(ELECTRON_EVENTS.DOWNLOAD_STARTED, (...args: unknown[]) => {
            const arg = Array.isArray(args) ? args[0] : null;
            const eventUrl = arg && typeof arg === 'object' && 'url' in arg ? arg.url : null;

            // This event is triggered for all active download instances. We intentionally keep other promises waiting.
            // Early resolution or rejection of other promises could prematurely stop the loading spinner or prevent the promise from being resolved.
            if (eventUrl === url) {
                clearTimeout(downloadTimeout);
                resolve();
            }
        });
    });
};

export default fileDownload;
