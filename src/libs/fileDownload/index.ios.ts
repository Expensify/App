import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';

import type {PhotoIdentifier} from '@react-native-camera-roll/camera-roll';

import {CameraRoll} from '@react-native-camera-roll/camera-roll';
import RNFetchBlob from 'react-native-blob-util';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

import type {FileDownload} from './types';

import {appendTimeToFileName, getFileName, getFileType, showGeneralErrorAlert, showPermissionErrorAlert, showSuccessAlert} from './FileUtils';

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
 * Downloads the file to the app's cache directory. The cache directory is not exposed
 * to the user, so files meant for the user must be handed off via the share sheet afterwards.
 */
function downloadFile(fileUrl: string, fileName: string) {
    const dirs = RNFetchBlob.fs.dirs;

    const path = dirs.CacheDir;

    // Fetching the attachment
    return RNFetchBlob.config({
        fileCache: true,
        path: `${path}/${fileName}`,
    }).fetch('GET', fileUrl);
}

/**
 * Presents the iOS share sheet so the user can save the file to the Files app,
 * then removes the local copy. The app sandbox is not browsable by the user,
 * so this hand-off is the only way a downloaded file reaches them.
 */
function shareFileToFilesApp(localPath: string) {
    return Share.open({url: localPath, failOnCancel: false, saveToFiles: true}).then(() => RNFS.unlink(localPath));
}

const postDownloadFile = (translate: LocalizedTranslate, url: string, fileName?: string, formData?: FormData, onDownloadFailed?: () => void, appendTimestamp = true) => {
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
            const resolvedFileName = fileName ?? 'Expensify';
            const finalFileName = appendTimestamp ? appendTimeToFileName(resolvedFileName) : resolvedFileName;
            const expensifyDir = `${RNFS.CachesDirectoryPath}/Expensify`;
            const localPath = `${expensifyDir}/${finalFileName}`;
            return RNFS.mkdir(expensifyDir).then(() => {
                return RNFS.writeFile(localPath, fileData, 'utf8').then(() => shareFileToFilesApp(localPath));
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
const fileDownload: FileDownload = (translate, fileUrl, fileName, successMessage, _, formData, requestType, onDownloadFailed, shouldUnlink, appendTimestamp = true) =>
    new Promise((resolve) => {
        let fileDownloadPromise;
        const fileType = getFileType(fileUrl);
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- Disabling this line for safeness as nullish coalescing works only if the value is undefined or null, and since fileName can be an empty string we want to default to `FileUtils.getFileName(url)`
        const resolvedFileName = fileName || getFileName(fileUrl);
        const attachmentName = appendTimestamp ? appendTimeToFileName(resolvedFileName) : resolvedFileName;

        switch (fileType) {
            case CONST.ATTACHMENT_FILE_TYPE.IMAGE:
                fileDownloadPromise = downloadImage(fileUrl);
                break;
            case CONST.ATTACHMENT_FILE_TYPE.VIDEO:
                fileDownloadPromise = downloadVideo(fileUrl, attachmentName);
                break;
            default:
                if (requestType === CONST.NETWORK.METHOD.POST) {
                    fileDownloadPromise = postDownloadFile(translate, fileUrl, fileName, formData, onDownloadFailed, appendTimestamp);
                    break;
                }

                // The downloaded file lives in the app cache, which the user cannot browse,
                // so hand it off through the share sheet ("Save to Files"). The share sheet
                // provides its own confirmation, so we resolve without a success alert.
                fileDownloadPromise = downloadFile(fileUrl, attachmentName)
                    .then((attachment) => {
                        const localPath = attachment.path();
                        if (!localPath) {
                            throw new Error('Error downloading file');
                        }
                        return shareFileToFilesApp(localPath);
                    })
                    .then(() => undefined)
                    .catch((err: unknown) => {
                        // If the user cancels the iOS share/save dialog, we exit silently without showing an error
                        if (isUserCancelled(err)) {
                            return undefined;
                        }
                        throw err;
                    });
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
