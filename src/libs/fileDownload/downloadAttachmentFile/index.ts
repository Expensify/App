import type DownloadAttachmentFile from './types';

import fileDownload from '..';

/**
 * Saves an attachment opened in the attachment modal. Everywhere but iOS this is the regular download.
 */
const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName, shouldUnlink) => {
    fileDownload(translate, url, fileName, undefined, undefined, undefined, undefined, undefined, shouldUnlink);
};

export default downloadAttachmentFile;
