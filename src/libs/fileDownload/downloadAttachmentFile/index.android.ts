import {downloadAndOfferToOpen} from '@libs/fileDownload/index.android';

import type DownloadAttachmentFile from './types';

import {hideDownloadingGrowl, showDownloadingGrowl} from './downloadingGrowl';

const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName, shouldUnlink) => {
    const growlNonce = showDownloadingGrowl(translate);
    return downloadAndOfferToOpen(translate, url, fileName, shouldUnlink).finally(() => hideDownloadingGrowl(growlNonce));
};

export default downloadAttachmentFile;
