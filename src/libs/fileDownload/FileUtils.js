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
    const fileName = new URL(fileUrl).pathname;
    if (isImage(fileName)) {
        return CONST.ATTACHMENT_FILE_TYPE.IMAGE;
    }
    if (isVideo(fileName)) {
        return CONST.ATTACHMENT_FILE_TYPE.VIDEO;
    }
    return CONST.ATTACHMENT_FILE_TYPE.FILE;
}

export {
    showGeneralErrorAlert,
    showSuccessAlert,
    showPermissionErrorAlert,
    getAttachmentName,
    getFileType,
};
