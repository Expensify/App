import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import type {PhotoIdentifier} from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CONST from '@src/CONST';
import {appendTimeToFileName, getFileName, getFileType, showGeneralErrorAlert, showPermissionErrorAlert, showSuccessAlert} from './FileUtils';
import type {FileDownload} from './types';

const isUserCancelled = (err: unknown) => {
    let msg = '';
    if (typeof err === 'string') {
        msg = err.toLowerCase();
    } else if (err && typeof err === 'object') {
        const errorMessage = (err as {message?: unknown}).message;
        const errorError = (err as {error?: unknown}).error;
        if (typeof errorMessage === 'string') {
            msg = errorMessage.toLowerCase();
        } else if (typeof errorError === 'string') {
            msg = errorError.toLowerCase();
        }
    }
    return /cancel|did not share/.test(msg);
};

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

const postDownloadFile = (translate: LocalizedTranslate, url: string, fileName?: string, formData?: FormData, onDownloadFailed?: () => void | Promise<void>) => {
    const fetchOptions: RequestInit = {
        method: 'POST',
        body: formData,
    };

    return fetch(url, fetchOptions)
        .then((response) => {
            if (!response.ok) {
                throw new Error('Failed to download file');
            }
            const contentType = response.headers.get('content-type');
            if (contentType === 'application/json' && fileName?.includes('.csv')) {
                throw new Error();
            }
            return response.text();
        })
        .then((fileData) => {
            const finalFileName = appendTimeToFileName(fileName ?? 'Expensify');
            const expensifyDir = `${RNFS.DocumentDirectoryPath}/Expensify`;
            const localPath = `${expensifyDir}/${finalFileName}`;
            return RNFS.mkdir(expensifyDir).then(() => {
                return RNFS.writeFile(localPath, fileData, 'utf8')
                    .then(() => Share.open({url: localPath, failOnCancel: false, saveToFiles: true}))
                    .then(() => RNFS.unlink(localPath));
            });
        })
        .catch((error) => {
            // If the user cancels the iOS share/save dialog, we exit silently without showing an error
            if (isUserCancelled(error)) {
                return;
            }
            if (!onDownloadFailed) {
                showGeneralErrorAlert(translate);
            }
            onDownloadFailed?.();
        });
};

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
                documentPathUri = attachment.data as string | null;
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
const fileDownload: FileDownload = (translate, fileUrl, fileName, successMessage, _, formData, requestType, onDownloadFailed) =>
    new Promise((resolve) => {
        let fileDownloadPromise;
        const fileType = getFileType(fileUrl);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
        const attachmentName = appendTimeToFileName(fileName || getFileName(fileUrl));

        switch (fileType) {
            case CONST.ATTACHMENT_FILE_TYPE.IMAGE:
                fileDownloadPromise = downloadImage(fileUrl);
                break;
            case CONST.ATTACHMENT_FILE_TYPE.VIDEO:
                fileDownloadPromise = downloadVideo(fileUrl, attachmentName);
                break;
            default:
                if (requestType === CONST.NETWORK.METHOD.POST) {
                    fileDownloadPromise = postDownloadFile(translate, fileUrl, fileName, formData, onDownloadFailed);
                    break;
                }

                fileDownloadPromise = downloadFile(fileUrl, attachmentName);
                break;
        }

        fileDownloadPromise
            .then((attachment) => {
                if (!attachment) {
                    return;
                }

                showSuccessAlert(translate, successMessage);
            })
            .catch((err: Error) => {
                // iOS shows permission popup only once. Subsequent request will only throw an error.
                // We catch the error and show a redirection link to the settings screen
                if (err.message === CONST.IOS_CAMERA_ROLL_ACCESS_ERROR) {
                    showPermissionErrorAlert(translate);
                } else {
                    showGeneralErrorAlert(translate);
                }
            })
            .finally(() => resolve());
    });

export default fileDownload;
