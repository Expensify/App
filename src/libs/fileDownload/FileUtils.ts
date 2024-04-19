import Str from 'expensify-common/lib/str';
import {Alert, Linking, Platform} from 'react-native';
import ImageSize from 'react-native-image-size';
import type {FileObject} from '@components/AttachmentModal';
import DateUtils from '@libs/DateUtils';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import CONST from '@src/CONST';
import type {ReadFileAsync, SplitExtensionFromFileName} from './types';

/**
 * Show alert on successful attachment download
 * @param successMessage
 */
function showSuccessAlert(successMessage?: string) {
    Alert.alert(
        Localize.translateLocal('fileDownload.success.title'),
        successMessage ?? Localize.translateLocal('fileDownload.success.message'),
        [
            {
                text: Localize.translateLocal('common.ok'),
                style: 'cancel',
            },
        ],
        {cancelable: false},
    );
}

/**
 * Show alert on attachment download error
 */
function showGeneralErrorAlert() {
    Alert.alert(Localize.translateLocal('fileDownload.generalError.title'), Localize.translateLocal('fileDownload.generalError.message'), [
        {
            text: Localize.translateLocal('common.cancel'),
            style: 'cancel',
        },
    ]);
}

/**
 * Show alert on attachment download permissions error
 */
function showPermissionErrorAlert() {
    Alert.alert(Localize.translateLocal('fileDownload.permissionError.title'), Localize.translateLocal('fileDownload.permissionError.message'), [
        {
            text: Localize.translateLocal('common.cancel'),
            style: 'cancel',
        },
        {
            text: Localize.translateLocal('common.settings'),
            onPress: () => {
                Linking.openSettings();
            },
        },
    ]);
}

/**
 * Inform the users when they need to grant camera access and guide them to settings
 */
function showCameraPermissionsAlert() {
    Alert.alert(
        Localize.translateLocal('attachmentPicker.cameraPermissionRequired'),
        Localize.translateLocal('attachmentPicker.expensifyDoesntHaveAccessToCamera'),
        [
            {
                text: Localize.translateLocal('common.cancel'),
                style: 'cancel',
            },
            {
                text: Localize.translateLocal('common.settings'),
                onPress: () => {
                    Linking.openSettings();
                },
            },
        ],
        {cancelable: false},
    );
}

/**
 * Extracts a filename from a given URL and sanitizes it for file system usage.
 *
 * This function takes a URL as input and performs the following operations:
 * 1. Extracts the last segment of the URL.
 * 2. Decodes the extracted segment from URL encoding to a plain string for better readability.
 * 3. Replaces any characters in the decoded string that are illegal in file names
 *    with underscores.
 */
function getFileName(url: string): string {
    const fileName = url.split('/').pop()?.split('?')[0].split('#')[0] ?? '';

    if (!fileName) {
        Log.warn('[FileUtils] Could not get attachment name', {url});
    }

    return decodeURIComponent(fileName).replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_');
}

function isImage(fileName: string): boolean {
    return CONST.FILE_TYPE_REGEX.IMAGE.test(fileName);
}

function isVideo(fileName: string): boolean {
    return CONST.FILE_TYPE_REGEX.VIDEO.test(fileName);
}

/**
 * Returns file type based on the uri
 */
function getFileType(fileUrl: string): string | undefined {
    if (!fileUrl) {
        return;
    }

    const fileName = getFileName(fileUrl);

    if (!fileName) {
        return;
    }

    if (isImage(fileName)) {
        return CONST.ATTACHMENT_FILE_TYPE.IMAGE;
    }
    if (isVideo(fileName)) {
        return CONST.ATTACHMENT_FILE_TYPE.VIDEO;
    }
    return CONST.ATTACHMENT_FILE_TYPE.FILE;
}

/**
 * Returns the filename split into fileName and fileExtension
 */
const splitExtensionFromFileName: SplitExtensionFromFileName = (fullFileName) => {
    const fileName = fullFileName.trim();
    const splitFileName = fileName.split('.');
    const fileExtension = splitFileName.length > 1 ? splitFileName.pop() : '';
    return {fileName: splitFileName.join('.'), fileExtension: fileExtension ?? ''};
};

/**
 * Returns the filename replacing special characters with underscore
 */
function cleanFileName(fileName: string): string {
    return fileName.replace(/[^a-zA-Z0-9\-._]/g, '_');
}

function appendTimeToFileName(fileName: string): string {
    const file = splitExtensionFromFileName(fileName);
    let newFileName = `${file.fileName}-${DateUtils.getDBTime()}`;
    // Replace illegal characters before trying to download the attachment.
    newFileName = newFileName.replace(CONST.REGEX.ILLEGAL_FILENAME_CHARACTERS, '_');
    if (file.fileExtension) {
        newFileName += `.${file.fileExtension}`;
    }
    return newFileName;
}

/**
 * Reads a locally uploaded file
 * @param path - the blob url of the locally uploaded file
 * @param fileName - name of the file to read
 */
const readFileAsync: ReadFileAsync = (path, fileName, onSuccess, onFailure = () => {}, fileType = '') =>
    new Promise((resolve) => {
        if (!path) {
            resolve();
            onFailure('[FileUtils] Path not specified');
            return;
        }
        fetch(path)
            .then((res) => {
                // For some reason, fetch is "Unable to read uploaded file"
                // on Android even though the blob is returned, so we'll ignore
                // in that case
                if (!res.ok && Platform.OS !== 'android') {
                    throw Error(res.statusText);
                }
                res.blob()
                    .then((blob) => {
                        // On Android devices, fetching blob for a file with name containing spaces fails to retrieve the type of file.
                        // In this case, let us fallback on fileType provided by the caller of this function.
                        const file = new File([blob], cleanFileName(fileName), {type: blob.type || fileType});
                        file.source = path;
                        // For some reason, the File object on iOS does not have a uri property
                        // so images aren't uploaded correctly to the backend
                        file.uri = path;
                        onSuccess(file);
                        resolve(file);
                    })
                    .catch((e) => {
                        console.debug('[FileUtils] Could not read uploaded file', e);
                        onFailure(e);
                        resolve();
                    });
            })
            .catch((e) => {
                console.debug('[FileUtils] Could not read uploaded file', e);
                onFailure(e);
                resolve();
            });
    });

/**
 * Converts a base64 encoded image string to a File instance.
 * Adds a `uri` property to the File instance for accessing the blob as a URI.
 *
 * @param base64 - The base64 encoded image string.
 * @param filename - Desired filename for the File instance.
 * @returns The File instance created from the base64 string with an additional `uri` property.
 *
 * @example
 * const base64Image = "data:image/png;base64,..."; // your base64 encoded image
 * const imageFile = base64ToFile(base64Image, "example.png");
 * console.log(imageFile.uri); // Blob URI
 */
function base64ToFile(base64: string, filename: string): File {
    // Decode the base64 string
    const byteString = atob(base64.split(',')[1]);

    // Get the mime type from the base64 string
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];

    // Convert byte string to Uint8Array
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }

    // Create a blob from the Uint8Array
    const blob = new Blob([uint8Array], {type: mimeString});

    // Create a File instance from the Blob
    const file = new File([blob], filename, {type: mimeString, lastModified: Date.now()});

    // Add a uri property to the File instance for accessing the blob as a URI
    file.uri = URL.createObjectURL(blob);

    return file;
}

function validateImageForCorruption(file: FileObject): Promise<void> {
    if (!Str.isImage(file.name ?? '')) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        ImageSize.getSize(file.uri ?? '')
            .then(() => resolve())
            .catch(() => reject(new Error('Error reading file: The file is corrupted')));
    });
}

export {
    showGeneralErrorAlert,
    showSuccessAlert,
    showPermissionErrorAlert,
    showCameraPermissionsAlert,
    splitExtensionFromFileName,
    getFileName,
    getFileType,
    cleanFileName,
    appendTimeToFileName,
    readFileAsync,
    base64ToFile,
    validateImageForCorruption,
};
