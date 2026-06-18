import type {FileDownload} from './types';

import fetchFileDownload from './DownloadUtils';

/**
 * The function downloads an attachment on web platforms.
 */
const fileDownload: FileDownload = (
    translate,
    url,
    fileName,
    successMessage = '',
    shouldOpenExternalLink = false,
    formData = undefined,
    requestType = 'get',
    onDownloadFailed?: () => void,
) => fetchFileDownload(translate, url, fileName, successMessage, shouldOpenExternalLink, formData, requestType, onDownloadFailed);

export default fileDownload;
