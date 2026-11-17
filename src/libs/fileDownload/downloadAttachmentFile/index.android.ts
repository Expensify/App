import {downloadAndOfferToOpen} from '@libs/fileDownload/index.android';

import type DownloadAttachmentFile from './types';

const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName, shouldUnlink) => downloadAndOfferToOpen(translate, url, fileName, shouldUnlink);

export default downloadAttachmentFile;
