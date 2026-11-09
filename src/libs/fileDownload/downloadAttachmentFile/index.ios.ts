import {appendTimeToFileName, getFileName, showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';

import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';

import type DownloadAttachmentFile from './types';

// The share sheet needs a local file, so the attachment goes to the cache directory (never shown by the Files app) and is removed afterwards.
// A file that is already on the device (e.g. a receipt that failed to upload) is shared as is and never removed.
const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName) => {
    if (url.startsWith('file://')) {
        return Share.open({url, failOnCancel: false})
            .then(() => {})
            .catch(() => showGeneralErrorAlert(translate));
    }

    const attachmentName = appendTimeToFileName(fileName || getFileName(url));
    const localPath = `${RNFetchBlob.fs.dirs.CacheDir}/${attachmentName}`;

    return RNFetchBlob.config({fileCache: true, path: localPath})
        .fetch('GET', url)
        .then(() => Share.open({url: `file://${localPath}`, failOnCancel: false}))
        .then(() => {})
        .catch(() => showGeneralErrorAlert(translate))
        .finally(() => RNFetchBlob.fs.unlink(localPath).catch(() => {}));
};

export default downloadAttachmentFile;
