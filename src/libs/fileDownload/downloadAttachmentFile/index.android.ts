import {appendTimeToFileName, getFileName, getMimeType, getMimeTypeFromUri, showGeneralErrorAlert, showPermissionErrorAlert, splitExtensionFromFileName} from '@libs/fileDownload/FileUtils';
import hasGalleryWritePermission from '@libs/fileDownload/hasGalleryWritePermission';
import saveLocalFileToGallery from '@libs/fileDownload/saveLocalFileToGallery';
import fileURIToPath from '@libs/fileURIToPath';

import type {FetchBlobResponse} from 'react-native-blob-util';

import {Alert} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';

import type DownloadAttachmentFile from './types';

/**
 * Same download as the regular one, but the success alert offers to open the saved file,
 * since the user has no other way to find where on the device it went.
 */
const downloadAttachmentFile: DownloadAttachmentFile = (translate, url, fileName, shouldUnlink = true) => {
    const attachmentName = appendTimeToFileName(fileName || getFileName(url));
    const mimeType = getMimeTypeFromUri(attachmentName) ?? getMimeType(splitExtensionFromFileName(attachmentName).fileExtension);
    const isLocalFile = url.startsWith('file://');

    hasGalleryWritePermission()
        .then((hasPermission) => {
            if (!hasPermission) {
                showPermissionErrorAlert(translate);
                return;
            }

            // copyToMediaStore and fs.unlink take a bare POSIX path, not a file:// URI.
            let attachmentPath = isLocalFile ? fileURIToPath(url) : undefined;
            let fetchedAttachment: Promise<FetchBlobResponse | undefined> = Promise.resolve(undefined);

            if (!isLocalFile) {
                fetchedAttachment = RNFetchBlob.config({
                    fileCache: true,
                    path: `${RNFetchBlob.fs.dirs.DownloadDir}/${attachmentName}`,
                    addAndroidDownloads: {
                        useDownloadManager: true,
                        notification: false,
                        path: `${RNFetchBlob.fs.dirs.DownloadDir}/Expensify/${attachmentName}`,
                    },
                }).fetch('GET', url);
            }

            return fetchedAttachment
                .then((attachment) => {
                    if (!isLocalFile && !attachment?.info()) {
                        return Promise.reject();
                    }

                    if (attachment) {
                        attachmentPath = attachment.path();
                    }

                    return saveLocalFileToGallery(isLocalFile ? url : (attachmentPath ?? ''), attachmentName, mimeType);
                })
                .then((savedFileURI) => {
                    if (attachmentPath && shouldUnlink) {
                        RNFetchBlob.fs.unlink(attachmentPath);
                    }

                    Alert.alert(
                        translate('fileDownload.success.title'),
                        translate('fileDownload.success.message'),
                        [
                            ...(savedFileURI
                                ? [
                                      {
                                          text: translate('fileDownload.success.open'),
                                          // Nothing to do when no installed app can open this type: the file is saved either way.
                                          onPress: () => RNFetchBlob.android.actionViewIntent(savedFileURI, mimeType).catch(() => {}),
                                      },
                                  ]
                                : []),
                            {text: translate('common.ok'), style: 'cancel'},
                        ],
                        {cancelable: false},
                    );
                });
        })
        .catch(() => {
            showGeneralErrorAlert(translate);
        });
};

export default downloadAttachmentFile;
