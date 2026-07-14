import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';

import type {FetchBlobResponse} from 'react-native-blob-util';

import {PermissionsAndroid, Platform} from 'react-native';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';

import type {FileDownload} from './types';

import {appendTimeToFileName, getFileName, showGeneralErrorAlert, showPermissionErrorAlert, showSuccessAlert} from './FileUtils';

/**
 * Android permission check to store images
 */
function hasAndroidPermission(): Promise<boolean> {
    // On Android API Level 33 and above, these permissions do nothing and always return 'never_ask_again'
    // More info here: https://stackoverflow.com/a/74296799
    if (Number(Platform.Version) >= 33) {
        return Promise.resolve(true);
    }

    // Read and write permission
    const writePromise = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
    const readPromise = PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE);

    return Promise.all([writePromise, readPromise]).then(([hasWritePermission, hasReadPermission]) => {
        if (hasWritePermission && hasReadPermission) {
            return true; // Return true if permission is already given
        }

        // Ask for permission if not given
        return PermissionsAndroid.requestMultiple([PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE, PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE]).then(
            (status) => status['android.permission.READ_EXTERNAL_STORAGE'] === 'granted' && status['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted',
        );
    });
}

/**
 * Handling the download
 */
function handleDownload(translate: LocalizedTranslate, url: string, fileName?: string, successMessage?: string, shouldUnlink = true, appendTimestamp = true): Promise<void> {
    return new Promise((resolve) => {
        const dirs = RNFetchBlob.fs.dirs;

        // Android files will download to Download directory
        const path = dirs.DownloadDir;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
        const resolvedFileName = fileName || getFileName(url);
        const attachmentName = appendTimestamp ? appendTimeToFileName(resolvedFileName) : resolvedFileName;

        const isLocalFile = url.startsWith('file://');

        let attachmentPath = isLocalFile ? decodeURI(url) : undefined;
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

                return RNFetchBlob.MediaCollection.copyToMediaStore(
                    {
                        name: attachmentName,
                        parentFolder: 'Expensify',
                        mimeType: null,
                    },
                    'Download',
                    attachmentPath ?? '',
                );
            })
            .then(() => {
                if (attachmentPath && shouldUnlink) {
                    RNFetchBlob.fs.unlink(attachmentPath);
                }
                showSuccessAlert(translate, successMessage);
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
        .then((downloadPath) =>
            RNFetchBlob.MediaCollection.copyToMediaStore(
                {
                    name: getFileName(downloadPath),
                    parentFolder: 'Expensify',
                    mimeType: null,
                },
                'Download',
                downloadPath,
            ).then(() => downloadPath),
        )
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
 * Checks permission and downloads the file for Android
 */
const fileDownload: FileDownload = (translate, url, fileName, successMessage, _, formData, requestType, onDownloadFailed, shouldUnlink, appendTimestamp = true) =>
    new Promise((resolve) => {
        hasAndroidPermission()
            .then((hasPermission) => {
                if (hasPermission) {
                    if (requestType === CONST.NETWORK.METHOD.POST) {
                        return postDownloadFile(translate, url, fileName, formData, onDownloadFailed, appendTimestamp);
                    }
                    return handleDownload(translate, url, fileName, successMessage, shouldUnlink, appendTimestamp);
                }
                showPermissionErrorAlert(translate);
            })
            .catch(() => {
                showPermissionErrorAlert(translate);
            })
            .finally(() => resolve());
    });

export default fileDownload;
