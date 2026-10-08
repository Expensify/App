import {appendTimeToFileName, getFileName, showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';

import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';

import type DownloadAttachmentFile from './types';

/**
 * The share sheet can only hand over a local file, so the attachment is first downloaded to the cache directory,
 * which the iOS Files app never shows. The cached copy is removed once the sheet is dismissed.
 */
const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName) => {
    const attachmentName = appendTimeToFileName(fileName || getFileName(url));
    const localPath = `${RNFetchBlob.fs.dirs.CacheDir}/${attachmentName}`;

    RNFetchBlob.config({fileCache: true, path: localPath})
        .fetch('GET', url)
        .then(() => Share.open({url: `file://${localPath}`, failOnCancel: false}))
        .catch(() => showGeneralErrorAlert(translate))
        .finally(() => RNFetchBlob.fs.unlink(localPath).catch(() => {}));
};

export default downloadAttachmentFile;
