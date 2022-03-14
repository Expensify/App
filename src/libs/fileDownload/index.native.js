import RNFetchBlob from 'rn-fetch-blob';
import getAttachmentName from './getAttachmentName';
import * as FileUtils from './FileUtils';

/**
 * Handling the download
 * @param {String} url
 * @param {String} fileName
 * @returns {Promise}
 */
function handleDownload(url, fileName) {
    return new Promise((resolve) => {
        const dirs = RNFetchBlob.fs.dirs;

        // ios files will download to documents directory
        const path = dirs.DocumentDir;
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

/**
 * Platform specifically check download
 * @param {String} url
 * @param {String} fileName
 * @returns {Promise} fileName
 */
export default function fileDownload(url, fileName) {
    return handleDownload(url, fileName);
}
