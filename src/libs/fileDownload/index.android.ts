import {PermissionsAndroid, Platform} from 'react-native';
import RNFetchBlob, {FetchBlobResponse} from 'react-native-blob-util';
import * as FileUtils from './FileUtils';

/**
 * Android permission check to store images
 */
function hasAndroidPermission() {
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
function handleDownload(url: string, fileName: string) {
    return new Promise<void>((resolve) => {
        const dirs = RNFetchBlob.fs.dirs;

        // Android files will download to Download directory
        const path = dirs.DownloadDir;
        const attachmentName = FileUtils.appendTimeToFileName(fileName) || FileUtils.getAttachmentName(url);

        const isLocalFile = url.startsWith('file://');

        let attachmentPath = isLocalFile ? url : undefined;
        let fetchedAttachment: Promise<FetchBlobResponse | void> = Promise.resolve();

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

                if (!isLocalFile) attachmentPath = attachment?.path() ?? '';

                return RNFetchBlob.MediaCollection.copyToMediaStore(
                    {
                        name: attachmentName,
                        parentFolder: 'Expensify',
                        mimeType: null,
                    },
                    'Download',
                    String(attachmentPath),
                );
            })
            .then(() => {
                RNFetchBlob.fs.unlink(String(attachmentPath));
                FileUtils.showSuccessAlert();
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
export default function fileDownload(url: string, fileName: string) {
    return new Promise<void>((resolve) => {
        hasAndroidPermission()
            .then((hasPermission) => {
                if (hasPermission) {
                    return handleDownload(url, fileName);
                }
                FileUtils.showPermissionErrorAlert();
            })
            .catch(() => {
                FileUtils.showPermissionErrorAlert();
            })
            .finally(() => resolve());
    });
}
