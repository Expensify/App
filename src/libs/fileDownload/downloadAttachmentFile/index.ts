import type DownloadAttachmentFile from './types';

import fileDownload from '..';

const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName, shouldUnlink) => {
    fileDownload(translate, url, fileName, undefined, undefined, undefined, undefined, undefined, shouldUnlink);
};

export default downloadAttachmentFile;
