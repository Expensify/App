import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import fileURIToPath from '@libs/fileURIToPath';

import CONST from '@src/CONST';

import type {FetchBlobResponse} from 'react-native-blob-util';

import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';

import type {FileDownload} from './types';

import {appendTimeToFileName, getFileName, getMimeType, getMimeTypeFromUri, showGeneralErrorAlert, showPermissionErrorAlert, showSuccessAlert, splitExtensionFromFileName} from './FileUtils';
import hasGalleryWritePermission from './hasGalleryWritePermission';
import saveLocalFileToGallery from './saveLocalFileToGallery';

/**
 * Handling the download
 */
function handleDownload(
    translate: LocalizedTranslate,
    url: string,
    fileName?: string,
    successMessage?: string,
    shouldUnlink = true,
    appendTimestamp = true,
    shouldShowOpenButton = false,
): Promise<void> {
    return new Promise((resolve) => {
        const dirs = RNFetchBlob.fs.dirs;

        // Android files will download to Download directory
        const path = dirs.DownloadDir;
        // `fileName` can be an empty string, so fall back to `FileUtils.getFileName(url)`
        const resolvedFileName = fileName || getFileName(url);
        const attachmentName = appendTimestamp ? appendTimeToFileName(resolvedFileName) : resolvedFileName;

        const mimeType = getMimeTypeFromUri(attachmentName) ?? getMimeType(splitExtensionFromFileName(attachmentName).fileExtension);
        const isLocalFile = url.startsWith('file://');

        // copyToMediaStore and fs.unlink take a bare POSIX path, not a file:// URI.
        let attachmentPath = isLocalFile ? fileURIToPath(url) : undefined;
        let fetchedAttachment: Promise<void | FetchBlobResponse> = Promise.resolve();

        if (!isLocalFile) {
            // Fetching the attachment
            fetchedAttachment = RNFetchBlob.config({
                fileCache: true,
                path: `${path}/${attachmentName}`,
                addAndroidDownloads: {
                    useDownloadManager: true,
                    notification: false,
                    path: `${path}/Expensify/${attachmentName}`,
                },
            }).fetch('GET', url);
        }

        // Resolving the fetched attachment
        fetchedAttachment
            .then((attachment) => {
                if (!isLocalFile && (!attachment || !attachment.info())) {
                    return Promise.reject();
                }

                if (!isLocalFile) {
                    attachmentPath = (attachment as FetchBlobResponse).path();
                }

                return saveLocalFileToGallery(isLocalFile ? url : (attachmentPath ?? ''), attachmentName, mimeType);
            })
            .then((savedFileURI) => {
                if (attachmentPath && shouldUnlink) {
                    RNFetchBlob.fs.unlink(attachmentPath);
                }
                // Nothing to do when no installed app can open this type: the file is saved either way.
                const openSavedFile =
                    shouldShowOpenButton && savedFileURI
                        ? () => {
                              RNFetchBlob.android.actionViewIntent(savedFileURI, mimeType).catch(() => {});
                          }
                        : undefined;
                showSuccessAlert(translate, successMessage, openSavedFile);
            })
            .catch(() => {
                showGeneralErrorAlert(translate);
            })
            .finally(() => resolve());
    });
}

const postDownloadFile = (translate: LocalizedTranslate, url: string, fileName?: string, formData?: FormData, onDownloadFailed?: () => void, appendTimestamp = true): Promise<void> => {
    const fetchOptions: RequestInit = {
        method: 'POST',
        body: formData,
    };

    return fetch(url, fetchOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to download file');
            }
            const contentType = response.headers.get('content-type');
            if (contentType === 'application/json' && fileName?.includes('.csv')) {
                throw new Error();
            }
            return response.text();
        })
        .then((fileData) => {
            const resolvedFileName = fileName ?? 'Expensify';
            const finalFileName = appendTimestamp ? appendTimeToFileName(resolvedFileName) : resolvedFileName;
            const downloadPath = `${RNFS.DownloadDirectoryPath}/${finalFileName}`;
            return RNFS.writeFile(downloadPath, fileData, 'utf8').then(() => downloadPath);
        })
        .then((downloadPath) => saveLocalFileToGallery(downloadPath, getFileName(downloadPath)).then(() => downloadPath))
        .then((downloadPath) => {
            RNFetchBlob.fs.unlink(downloadPath);
            showSuccessAlert(translate);
        })
        .catch(() => {
            if (!onDownloadFailed) {
                showGeneralErrorAlert(translate);
            }
            onDownloadFailed?.();
        });
};

/**
 * Runs the download only when the app may write to the Downloads directory
 */
const downloadWithGalleryWritePermission = (translate: LocalizedTranslate, download: () => Promise<void>): Promise<void> =>
    new Promise((resolve) => {
        hasGalleryWritePermission()
            .then((hasPermission) => {
                if (hasPermission) {
                    return download();
                }
                showPermissionErrorAlert(translate);
            })
            .catch(() => {
                showPermissionErrorAlert(translate);
            })
            .finally(() => resolve());
    });

/**
 * Checks permission and downloads the file for Android
 */
const fileDownload: FileDownload = (translate, url, fileName, successMessage, _, formData, requestType, onDownloadFailed, shouldUnlink, appendTimestamp = true) =>
    downloadWithGalleryWritePermission(translate, () => {
        if (requestType === CONST.NETWORK.METHOD.POST) {
            return postDownloadFile(translate, url, fileName, formData, onDownloadFailed, appendTimestamp);
        }
        return handleDownload(translate, url, fileName, successMessage, shouldUnlink, appendTimestamp);
    });

/**
 * Downloads an attachment and offers to open the saved file
 */
const downloadAndOfferToOpen = (translate: LocalizedTranslate, url: string, fileName: string, shouldUnlink?: boolean): Promise<void> =>
    downloadWithGalleryWritePermission(translate, () => handleDownload(translate, url, fileName, undefined, shouldUnlink, true, true));

export default fileDownload;
export {downloadAndOfferToOpen};
