import {Alert, Linking, Platform} from 'react-native';
import DateUtils from '@libs/DateUtils';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';

/**
 * Show alert on successful attachment download
 */
function showSuccessAlert() {
    Alert.alert(
        Localize.translateLocal('fileDownload.success.title'),
        Localize.translateLocal('fileDownload.success.message'),
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
            onPress: () => Linking.openSettings(),
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
                onPress: () => Linking.openSettings(),
            },
        ],
        {cancelable: false},
    );
}

/**
 * Generate a random file name with timestamp and file extension
 * @param {String} url
 * @returns {String}
 */
function getAttachmentName(url) {
    if (!url) {
        return '';
    }
    return `${DateUtils.getDBTime()}.${url.split(/[#?]/)[0].split('.').pop().trim()}`;
}

/**
 * @param {String} fileName
 * @returns {Boolean}
 */
function isImage(fileName) {
    return CONST.FILE_TYPE_REGEX.IMAGE.test(fileName);
}

/**
 * @param {String} fileName
 * @returns {Boolean}
 */
function isVideo(fileName) {
    return CONST.FILE_TYPE_REGEX.VIDEO.test(fileName);
}

/**
 * Returns file type based on the uri
 * @param {String} fileUrl
 * @returns {String}
 */
function getFileType(fileUrl) {
    if (!fileUrl) {
        return;
    }
    const fileName = fileUrl.split('/').pop().split('?')[0].split('#')[0];
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
 *
 * @param {String} fullFileName
 * @returns {Object}
 */
function splitExtensionFromFileName(fullFileName) {
    const fileName = fullFileName.trim();
    const splitFileName = fileName.split('.');
    const fileExtension = splitFileName.length > 1 ? splitFileName.pop() : '';
    return {fileName: splitFileName.join('.'), fileExtension};
}

/**
 * Returns the filename replacing special characters with underscore
 *
 * @param {String} fileName
 * @returns {String}
 */
function cleanFileName(fileName) {
    return fileName.replace(/[^a-zA-Z0-9\-._]/g, '_');
}

/**
 * @param {String} fileName
 * @returns {String}
 */
function appendTimeToFileName(fileName) {
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
 *
 * @param {String} path - the blob url of the locally uplodaded file
 * @param {String} fileName
 * @returns {Promise}
 */
const readFileAsync = (path, fileName) =>
    new Promise((resolve) => {
        if (!path) {
            resolve();
        }

        return fetch(path)
            .then((res) => {
                // For some reason, fetch is "Unable to read uploaded file"
                // on Android even though the blob is returned, so we'll ignore
                // in that case
                if (!res.ok && Platform.OS !== 'android') {
                    throw Error(res.statusText);
                }
                return res.blob();
            })
            .then((blob) => {
                const file = new File([blob], cleanFileName(fileName), {type: blob.type});
                file.source = path;
                // For some reason, the File object on iOS does not have a uri property
                // so images aren't uploaded correctly to the backend
                file.uri = path;
                resolve(file);
            })
            .catch((e) => {
                console.debug('[FileUtils] Could not read uploaded file', e);
                resolve();
            });
    });

/**
 * Converts a base64 encoded image string to a File instance.
 * Adds a `uri` property to the File instance for accessing the blob as a URI.
 *
 * @param {string} base64 - The base64 encoded image string.
 * @param {string} filename - Desired filename for the File instance.
 * @returns {File} The File instance created from the base64 string with an additional `uri` property.
 *
 * @example
 * const base64Image = "data:image/png;base64,..."; // your base64 encoded image
 * const imageFile = base64ToFile(base64Image, "example.png");
 * console.log(imageFile.uri); // Blob URI
 */
function base64ToFile(base64, filename) {
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

export {
    showGeneralErrorAlert,
    showSuccessAlert,
    showPermissionErrorAlert,
    showCameraPermissionsAlert,
    splitExtensionFromFileName,
    getAttachmentName,
    getFileType,
    cleanFileName,
    appendTimeToFileName,
    readFileAsync,
    base64ToFile,
};
