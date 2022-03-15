import {Alert, Linking, PermissionsAndroid} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import getPlatform from '../getPlatform';
import getAttachmentName from './getAttachmentName';

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
 * Re useable alert function
 * @param {Object} content
 */
function showAlert(content) {
    Alert.alert(
        content.title || '',
        content.message || '',
        content.options || [],
        {cancelable: false},
    );
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
        // ios files will download to documents directory
        const path = getPlatform() === 'android' ? dirs.DownloadDir : dirs.DocumentDir;
        const attachmentName = fileName || getAttachmentName(url);

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

            showAlert({
                title: 'Downloaded!',
                message: 'Attachment successfully downloaded',
                options: [
                    {
                        text: 'OK',
                        style: 'cancel',
                    },
                ],
            });
            return resolve();
        }).catch(() => {
            showAlert({
                title: 'Attachment Error',
                message: 'Attachment cannot be downloaded',
                options: [
                    {
                        text: 'Cancel',
                        style: 'cancel',
                    },
                ],
            });
            return resolve();
        });
    });
}

/**
 * Platform specifically check download
 * @param {String} url
 * @param {String} fileName
 * @returns {Promise} fileName
 */
export default function fileDownload(url, fileName) {
    return new Promise((resolve) => {
        const permissionError = {
            title: 'Access Needed',
            // eslint-disable-next-line max-len
            message: 'NewExpensify does not have access to save attachments. To enable access, tap Settings and allow access.',
            options: [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Settings',
                    onPress: () => Linking.openSettings(),
                },
            ],
        };

        // permission check for android
        if (getPlatform() === 'android') {
            hasAndroidPermission().then((hasPermission) => {
                if (hasPermission) {
                    handleDownload(url, fileName).then(() => resolve());
                } else {
                    showAlert(permissionError);
                }
                return resolve();
            }).catch(() => {
                showAlert(permissionError);
                return resolve();
            });
        } else {
            handleDownload(url, fileName).then(() => resolve());
        }
    });
}
