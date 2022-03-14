import RNFetchBlob from 'rn-fetch-blob';
import RNCameraRoll from '@react-native-community/cameraroll';
import * as FileUtils from './FileUtils';

/**
 * Handling the download
 * @param {String} fileUrl
 * @param {String} fileName
 * @returns {Promise}
 */
function downloadDocument(fileUrl, fileName) {
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
    return RNCameraRoll.CameraRoll.save(fileUrl);
}

function downloadVideo(fileUrl) {
    return RNCameraRoll.CameraRoll.save(fileUrl);
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
        const fileType = 'image'; // getFileType(fileUrl);
        switch (fileType) {
            case 'image':
                fileDownloadPromise = downloadImage(fileUrl, fileName);
                break;
            case 'video':
                fileDownloadPromise = downloadVideo(fileUrl, fileName);
                break;
            default:
                fileDownloadPromise = downloadDocument(fileUrl, fileName);
                break;
        }

        fileDownloadPromise.then((attachment) => {
            if (!attachment || !attachment.info()) {
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
        }).catch(() => {
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
            return resolve();
        });
    });
}
