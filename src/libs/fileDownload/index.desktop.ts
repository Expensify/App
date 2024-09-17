import ELECTRON_EVENTS from '@desktop/ELECTRON_EVENTS';
import type Options from '@desktop/electronDownloadManagerType';
import CONST from '@src/CONST';
import fetchFileDownload from './DownloadUtils';
import type {FileDownload} from './types';

/**
 * The function downloads an attachment on desktop platforms.
 */
const fileDownload: FileDownload = (url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed?: () => void) => {
    if (requestType === CONST.NETWORK.METHOD.POST) {
        window.electron.send(ELECTRON_EVENTS.DOWNLOAD);
        return fetchFileDownload(url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed);
    }

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

        const handleDownloadStatus = (...args: unknown[]) => {
            const arg = Array.isArray(args) ? args[0] : null;
            const eventUrl = arg && typeof arg === 'object' && 'url' in arg ? arg.url : null;

            if (eventUrl === url) {
                clearTimeout(downloadTimeout);
                resolve();
            }
        };

        window.electron.on(ELECTRON_EVENTS.DOWNLOAD_COMPLETED, handleDownloadStatus);
        window.electron.on(ELECTRON_EVENTS.DOWNLOAD_FAILED, handleDownloadStatus);
        window.electron.on(ELECTRON_EVENTS.DOWNLOAD_CANCELED, handleDownloadStatus);
    });
};

export default fileDownload;
