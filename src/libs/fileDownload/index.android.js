import {PermissionsAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import * as FileUtils from './FileUtils';

/**
 * Android permission check to store images
 * @returns{Promise}
 */
function hasAndroidPermission() {
    return new Promise((resolve, reject) => {
        // read and write permission
        const readPermission = PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE;
        const writePermission = PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE;

        const writePromise = PermissionsAndroid.check(writePermission);
        const readPromise = PermissionsAndroid.check(readPermission);

        Promise.all([writePromise, readPromise]).then(([hasWritePermission, hasReadPermission]) => {
            if (hasWritePermission && hasReadPermission) {
                resolve(true); // return true if permission is already given
                return;
            }

            // ask for permission if not given
            PermissionsAndroid.requestMultiple([
                readPermission,
                writePermission,
            ]).then((status) => {
                resolve(status['android.permission.READ_EXTERNAL_STORAGE'] === 'granted'
                    && status['android.permission.WRITE_EXTERNAL_STORAGE'] === 'granted');
            });
        }).catch(error => reject(error));
    });
}

/**
 * Handling the download
 * @param {String} url
 * @param {String} fileName
 * @returns {Promise}
 */
function handleDownload(url, fileName) {
    return new Promise((resolve) => {
        const dirs = RNFetchBlob.fs.dirs;

        // android files will download to Download directory
        const path = dirs.DownloadDir;
        const attachmentName = fileName || FileUtils.getAttachmentName(url);

        // fetching the attachment
        const fetchedAttachment = RNFetchBlob.config({
            fileCache: true,
            path: `${path}/${attachmentName}`,
            addAndroidDownloads: {
                useDownloadManager: true,
                notification: true,
                path: `${path}/Expensify/${attachmentName}`,
            },
        }).fetch('GET', url);

        // resolving the fetched attachment
        fetchedAttachment.then((attachment) => {
            if (!attachment || !attachment.info()) {
                return;
            }

            FileUtils.showAlert(FileUtils.ALERT_TYPES.SUCCESS);
            return resolve();
        }).catch(() => {
            FileUtils.showAlert(FileUtils.ALERT_TYPES.GENERAL_ERROR);
            return resolve();
        });
    });
}

/**
 * Checks permission and downloads the file for Android
 * @param {String} url
 * @param {String} fileName
 * @returns {Promise}
 */
export default function fileDownload(url, fileName) {
    return new Promise((resolve) => {
        hasAndroidPermission().then((hasPermission) => {
            if (hasPermission) {
                handleDownload(url, fileName).then(() => resolve());
            } else {
                FileUtils.showAlert(FileUtils.ALERT_TYPES.PERMISSION_ERROR);
            }
            return resolve();
        }).catch(() => {
            FileUtils.showAlert(FileUtils.ALERT_TYPES.PERMISSION_ERROR);
            return resolve();
        });
    });
}
