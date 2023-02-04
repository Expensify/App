import RNFetchBlob from 'react-native-blob-util';
import CameraRoll from '@react-native-community/cameraroll';
import lodashGet from 'lodash/get';
import * as FileUtils from './FileUtils';
import CONST from '../../CONST';

/**
 * Downloads the file to Documents section in iOS
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {Promise}
 */
function downloadFile(fileUrl, fileName) {
    const dirs = RNFetchBlob.fs.dirs;

    // The iOS files will download to documents directory
    const path = dirs.DocumentDir;

    // Fetching the attachment
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

/**
 * Download the image to photo lib in iOS
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {String} URI
 */
function downloadImage(fileUrl) {
    return CameraRoll.save(fileUrl);
}

/**
 * Download the video to photo lib in iOS
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {String} URI
 */
function downloadVideo(fileUrl, fileName) {
    return new Promise((resolve, reject) => {
        let documentPathUri = null;
        let cameraRollUri = null;

        // Because CameraRoll doesn't allow direct downloads of video with remote URIs, we first download as documents, then copy to photo lib and unlink the original file.
        downloadFile(fileUrl, fileName).then((attachment) => {
            documentPathUri = lodashGet(attachment, 'data');
            return CameraRoll.save(documentPathUri);
        }).then((attachment) => {
            cameraRollUri = attachment;
            return RNFetchBlob.fs.unlink(documentPathUri);
        }).then(() => resolve(cameraRollUri))
            .catch(err => reject(err));
    });
}

/**
 * Download the file based on type(image, video, other file types)for iOS
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {Promise<Void>}
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

            FileUtils.showSuccessAlert();
        }).catch((err) => {
            // iOS shows permission popup only once. Subsequent request will only throw an error.
            // We catch the error and show a redirection link to the settings screen
            if (err.message === CONST.IOS_CAMERAROLL_ACCESS_ERROR) {
                FileUtils.showPermissionErrorAlert();
            } else {
                FileUtils.showGeneralErrorAlert();
            }
        }).finally(() => resolve());
    });
}
