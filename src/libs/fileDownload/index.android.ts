import {PermissionsAndroid, Platform} from 'react-native';
import type {FetchBlobResponse} from 'react-native-blob-util';
import RNFetchBlob from 'react-native-blob-util';
import * as FileUtils from './FileUtils';
import type {FileDownload} from './types';

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
function handleDownload(url: string, fileName?: string, successMessage?: string): Promise<void> {
    return new Promise((resolve) => {
        const dirs = RNFetchBlob.fs.dirs;

        // Android files will download to Download directory
        const path = dirs.DownloadDir;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
        const attachmentName = FileUtils.appendTimeToFileName(fileName || FileUtils.getFileName(url));

        const isLocalFile = url.startsWith('file://');

        let attachmentPath = isLocalFile ? url : undefined;
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
                if (attachmentPath) {
                    RNFetchBlob.fs.unlink(attachmentPath);
                }
                FileUtils.showSuccessAlert(successMessage);
            })
            .catch(() => {
                FileUtils.showGeneralErrorAlert();
            })
            .finally(() => resolve());
    });
}

/**
 * Checks permission and downloads the file for Android
 */
const fileDownload: FileDownload = (url, fileName, successMessage) =>
    new Promise((resolve) => {
        hasAndroidPermission()
            .then((hasPermission) => {
                if (hasPermission) {
                    return handleDownload(url, fileName, successMessage);
                }
                FileUtils.showPermissionErrorAlert();
            })
            .catch(() => {
                FileUtils.showPermissionErrorAlert();
            })
            .finally(() => resolve());
    });

export default fileDownload;
