import RNFetchBlob from 'rn-fetch-blob';
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

/**
 * Downloads the image to photo lib in iOS and returns the uri
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {String}
 */
function downloadImage(fileUrl) {
    return CameraRoll.save(fileUrl);
}

/**
 * Downloads the video to photo lib in iOS and returns the uri
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {String}
 */
function downloadVideo(fileUrl, fileName) {
    return new Promise((resolve) => {
        let documentPathUri = null;
        let cameraRollUri = null;

        // Because CameraRoll doesn't allow remote URIs to save the video,
        // we first download to documents, then copy to photo lib and unlink the original file,
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
            if (err.message === CONST.IOS_CAMERAROLL_ACCESS_ERROR) {
                FileUtils.showPermissionErrorAlert();
            } else {
                FileUtils.showGeneralErrorAlert();
            }
        }).finally(() => resolve());
    });
}
