import type {FileDownload} from './types';
import ELECTRON_EVENTS from '../../../desktop/ELECTRON_EVENTS';
import type { Options } from '@libs/downloadQueue/electronDownloadManager';

/**
 * The function downloads an attachment on desktop platforms.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const fileDownload: FileDownload = (url, fileName, successMessage = '', shouldOpenExternalLink = false) => {
    const options: Options ={ 
        filename: fileName,
        saveAs: true,
        //showing badge and progress bar only supported on macos and linux, better to disable it
        showBadge: false,
        showProgressBar: false
    } 
    window.electron.send(ELECTRON_EVENTS.DOWNLOAD, { url, options} )
    return Promise.resolve();
};

export default fileDownload;
