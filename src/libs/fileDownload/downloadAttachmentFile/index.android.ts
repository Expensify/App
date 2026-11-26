import {downloadAndOfferToOpen} from '@libs/fileDownload/index.android';

import type DownloadAttachmentFile from './types';

import {showPreparingToast} from './preparingToast';

const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName, shouldUnlink) => {
    showPreparingToast(translate);
    return downloadAndOfferToOpen(translate, url, fileName, shouldUnlink);
};

export default downloadAttachmentFile;
