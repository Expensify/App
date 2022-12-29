import {Alert, Linking} from 'react-native';
import moment from 'moment';
import CONST from '../../CONST';
import * as Localize from '../Localize';

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
    Alert.alert(
        Localize.translateLocal('fileDownload.generalError.title'),
        Localize.translateLocal('fileDownload.generalError.message'),
        [
            {
                text: Localize.translateLocal('common.cancel'),
                style: 'cancel',
            },
        ],
    );
}

/**
 * Show alert on attachment download permissions error
 */
function showPermissionErrorAlert() {
    Alert.alert(
        Localize.translateLocal('fileDownload.permissionError.title'),
        Localize.translateLocal('fileDownload.permissionError.message'),
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
    return `${moment().format('DDMMYYYYHHmmss')}.${url.split(/[#?]/)[0].split('.').pop().trim()}`;
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
    const fileExtension = splitFileName.pop();
    return {fileName: splitFileName.join('.'), fileExtension};
}

/**
 * Returns image dimensions for picked File object
 * File object is returned as a result of a user selecting files using the <input> element
 *
 * @param {*} file Picked file blob
 * @returns {Promise}
 */
function getImageBlobResolution(file) {
    if (!(file instanceof File)) {
        return Promise.reject(new Error('Object is not an instance of File'));
    }

    return new Promise((resolve, reject) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(file);
        image.onload = function () {
            resolve({
                width: this.naturalWidth,
                height: this.naturalHeight,
            });
            URL.revokeObjectURL(objectUrl);
        };
        image.onerror = reject;
        image.src = objectUrl;
    });
}

export {
    showGeneralErrorAlert,
    showSuccessAlert,
    showPermissionErrorAlert,
    splitExtensionFromFileName,
    getAttachmentName,
    getFileType,
    getImageBlobResolution,
};
