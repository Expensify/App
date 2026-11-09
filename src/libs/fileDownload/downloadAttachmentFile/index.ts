import type DownloadAttachmentFile from './types';

import fileDownload from '..';

const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName, shouldUnlink, shouldOpenExternalLink) =>
    fileDownload(translate, url, fileName, undefined, shouldOpenExternalLink, undefined, undefined, undefined, shouldUnlink);

export default downloadAttachmentFile;
