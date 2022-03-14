import {Linking} from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import CameraRoll from '@react-native-community/cameraroll';
import lodashGet from 'lodash/get';
import * as FileUtils from './FileUtils';
import CONST from '../../CONST';

/**
 * Handling the download
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {Promise}
 */
function downloadFile(fileUrl, fileName) {
    const dirs = RNFetchBlob.fs.dirs;

    // ios files will download to documents directory
    const path = dirs.DocumentDir;

    // fetching the attachment
    const fetchedAttachment = RNFetchBlob.config({
        fileCache: true,
        path: `${path}/${fileName}`,
        addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: `${path}/Expensify/${fileName}`,
        },
    }).fetch('GET', fileUrl);
    return fetchedAttachment;
}

function downloadImage(fileUrl) {
    return CameraRoll.save(fileUrl);
}

function downloadVideo(fileUrl, fileName) {
    return new Promise((resolve) => {
        let documentPathUri = null;
        let cameraRollUri = null;
        downloadFile(fileUrl, fileName).then((attachment) => {
            documentPathUri = lodashGet(attachment, 'data');
            return CameraRoll.save(documentPathUri);
        }).then((attachment) => {
            cameraRollUri = attachment;
            return RNFetchBlob.fs.unlink(documentPathUri);
        }).then(() => resolve(cameraRollUri));
    });
}

/**
 * File type based download for iOS
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {Promise}
 */
export default function fileDownload(fileUrl, fileName) {
    return new Promise((resolve) => {
        let fileDownloadPromise = null;
        const fileType = FileUtils.getFileType(fileUrl);
        const attachmentName = fileName || FileUtils.getAttachmentName(fileUrl);

        switch (fileType) {
            case CONST.ATTACHMENT_FILE_TYPE.IMAGE:
                fileDownloadPromise = downloadImage(fileUrl, attachmentName);
                break;
            case CONST.ATTACHMENT_FILE_TYPE.VIDEO:
                fileDownloadPromise = downloadVideo(fileUrl, attachmentName);
                break;
            default:
                fileDownloadPromise = downloadFile(fileUrl, attachmentName);
                break;
        }

        fileDownloadPromise.then((attachment) => {
            if (!attachment) {
                return;
            }

            FileUtils.showAlert({
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
        }).catch((err) => {
            if (err.message === CONST.IOS_CAMERAROLL_ACCESS_ERROR) {
                FileUtils.showAlert({
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
                });
            } else {
                FileUtils.showAlert({
                    title: 'Attachment Error',
                    message: 'Attachment cannot be downloaded',
                    options: [
                        {
                            text: 'Cancel',
                            style: 'cancel',
                        },
                    ],
                });
            }
            return resolve();
        });
    });
}
