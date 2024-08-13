import fetchFileDownload from './DownloadUtils';
import type {FileDownload} from './types';

/**
 * The function downloads an attachment on web/desktop platforms.
 */
const fileDownload: FileDownload = (url, fileName, successMessage = '', shouldOpenExternalLink = false, formData = undefined, requestType = 'get', onDownloadFailed?: () => void) =>
    fetchFileDownload(url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed);

export default fileDownload;
