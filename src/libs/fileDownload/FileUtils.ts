import {Alert, Linking, Platform} from 'react-native';
import CONST from '../../CONST';
import * as Localize from '../Localize';
import DateUtils from '../DateUtils';
import {ReadFileAsync, SplitExtensionFromFileName} from './types';

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
            onPress: () => {
                Linking.openSettings();
            },
        },
    ]);
}

/**
 * Generate a random file name with timestamp and file extension
 */
function getAttachmentName(url: string): string {
    if (!url) {
        return '';
    }
    return `${DateUtils.getDBTime()}.${url.split(/[#?]/)[0].split('.').pop()?.trim()}`;
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

    const fileName = fileUrl.split('/').pop()?.split('?')[0].split('#')[0];

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
const splitExtensionFromFileName: SplitExtensionFromFileName = (fullFileName: string) => {
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
 */
const readFileAsync: ReadFileAsync = (path, fileName) =>
    new Promise((resolve) => {
        if (!path) {
            resolve();
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
                        const file = new File([blob], cleanFileName(fileName));
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
            })
            .catch((e) => {
                console.debug('[FileUtils] Could not read uploaded file', e);
                resolve();
            });
    });

export {showGeneralErrorAlert, showSuccessAlert, showPermissionErrorAlert, splitExtensionFromFileName, getAttachmentName, getFileType, cleanFileName, appendTimeToFileName, readFileAsync};
