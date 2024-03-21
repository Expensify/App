import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import type {PhotoIdentifier} from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'react-native-blob-util';
import CONST from '@src/CONST';
import * as FileUtils from './FileUtils';
import type {FileDownload} from './types';

/**
 * Downloads the file to Documents section in iOS
 */
function downloadFile(fileUrl: string, fileName: string) {
    const dirs = RNFetchBlob.fs.dirs;

    // The iOS files will download to documents directory
    const path = dirs.DocumentDir;

    // Fetching the attachment
    return RNFetchBlob.config({
        fileCache: true,
        path: `${path}/${fileName}`,
        addAndroidDownloads: {
            useDownloadManager: true,
            notification: true,
            path: `${path}/Expensify/${fileName}`,
        },
    }).fetch('GET', fileUrl);
}

/**
 * Download the image to photo lib in iOS
 */
function downloadImage(fileUrl: string) {
    return CameraRoll.saveAsset(fileUrl);
}

/**
 * Download the video to photo lib in iOS
 */
function downloadVideo(fileUrl: string, fileName: string): Promise<PhotoIdentifier> {
    return new Promise((resolve, reject) => {
        let documentPathUri: string | null = null;
        let cameraRollAsset: PhotoIdentifier;

        // Because CameraRoll doesn't allow direct downloads of video with remote URIs, we first download as documents, then copy to photo lib and unlink the original file.
        downloadFile(fileUrl, fileName)
            .then((attachment) => {
                documentPathUri = attachment.data;
                if (!documentPathUri) {
                    throw new Error('Error downloading video');
                }
                return CameraRoll.saveAsset(documentPathUri);
            })
            .then((attachment) => {
                cameraRollAsset = attachment;
                if (!documentPathUri) {
                    throw new Error('Error downloading video');
                }
                return RNFetchBlob.fs.unlink(documentPathUri);
            })
            .then(() => {
                resolve(cameraRollAsset);
            })
            .catch((err) => reject(err));
    });
}

/**
 * Download the file based on type(image, video, other file types)for iOS
 */
const fileDownload: FileDownload = (fileUrl, fileName, successMessage) =>
    new Promise((resolve) => {
        let fileDownloadPromise;
        const fileType = FileUtils.getFileType(fileUrl);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
        const attachmentName = FileUtils.appendTimeToFileName(fileName || FileUtils.getFileName(fileUrl));

        switch (fileType) {
            case CONST.ATTACHMENT_FILE_TYPE.IMAGE:
                fileDownloadPromise = downloadImage(fileUrl);
                break;
            case CONST.ATTACHMENT_FILE_TYPE.VIDEO:
                fileDownloadPromise = downloadVideo(fileUrl, attachmentName);
                break;
            default:
                fileDownloadPromise = downloadFile(fileUrl, attachmentName);
                break;
        }

        fileDownloadPromise
            .then((attachment) => {
                if (!attachment) {
                    return;
                }

                FileUtils.showSuccessAlert(successMessage);
            })
            .catch((err) => {
                // iOS shows permission popup only once. Subsequent request will only throw an error.
                // We catch the error and show a redirection link to the settings screen
                if (err.message === CONST.IOS_CAMERAROLL_ACCESS_ERROR) {
                    FileUtils.showPermissionErrorAlert();
                } else {
                    FileUtils.showGeneralErrorAlert();
                }
            })
            .finally(() => resolve());
    });

export default fileDownload;
