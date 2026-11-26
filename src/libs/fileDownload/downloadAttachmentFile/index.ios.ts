import {appendTimeToFileName, getFileName, showGeneralErrorAlert} from '@libs/fileDownload/FileUtils';
import {endShareSheet, startShareSheet} from '@libs/fileDownload/shareSheetState';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import RNFetchBlob from 'react-native-blob-util';
import Share from 'react-native-share';

import type DownloadAttachmentFile from './types';

import {showPreparingToast} from './preparingToast';

// UIKit can't present the share sheet while a modal (e.g. the context menu) is mid-presentation, so wait until no modal transition is running.
// Context menus are ignored from right before the sheet is opened until it is closed (see shareSheetState), because UIKit can't present them over the sheet.
function openShareSheet(url: string) {
    return new Promise<void>((resolve) => {
        TransitionTracker.runAfterTransitions({callback: resolve});
    }).then(() => {
        startShareSheet();
        return Share.open({url, failOnCancel: false}).finally(endShareSheet);
    });
}

// The share sheet needs a local file, so the attachment goes to the cache directory (never shown by the Files app) and is removed afterwards.
// A file that is already on the device (e.g. a receipt that failed to upload) is shared as is and never removed.
const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName) => {
    if (url.startsWith('file://')) {
        return openShareSheet(url)
            .then(() => {})
            .catch(() => showGeneralErrorAlert(translate));
    }

    showPreparingToast(translate);
    const attachmentName = appendTimeToFileName(fileName || getFileName(url));
    const localPath = `${RNFetchBlob.fs.dirs.CacheDir}/${attachmentName}`;

    return RNFetchBlob.config({fileCache: true, path: localPath})
        .fetch('GET', url)
        .then(() => openShareSheet(`file://${localPath}`))
        .then(() => {})
        .catch(() => showGeneralErrorAlert(translate))
        .finally(() => {
            RNFetchBlob.fs.unlink(localPath).catch(() => {});
        });
};

export default downloadAttachmentFile;
