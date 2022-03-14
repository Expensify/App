import {Alert, Linking} from 'react-native';
import moment from 'moment';
import * as mime from 'react-native-mime-types';
import CONST from '../../CONST';
import * as Localize from '../Localize';

/**
 * Re useable alert function
 * @param {Object} content
 */
function showAlert(content) {
    Alert.alert(
        content.title || '',
        content.message || '',
        content.options || [],
        {cancelable: false},
    );
}

/**
 * Generating a random file name with timestamp and file extention
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
 * Returns file type based on the uri
 * @param {String} fileUri
 * @returns {String}
 */

function getFileType(fileUrl) {
    if (!fileUrl) {
        return;
    }
    const fileName = fileUrl.split('/').pop().split('?')[0].split('#')[0];
    const contentType = mime.contentType(fileName);
    if (contentType.startsWith('image')) {
        return CONST.ATTACHMENT_FILE_TYPE.IMAGE;
    }
    if (contentType.startsWith('video')) {
        return CONST.ATTACHMENT_FILE_TYPE.VIDEO;
    }
    return CONST.ATTACHMENT_FILE_TYPE.FILE;
}

const ALERT_TYPES = {
    SUCCESS: {
        title: Localize.translateLocal('fileDownload.success.title'),
        message: Localize.translateLocal('fileDownload.success.message'),
        options: [
            {
                text: Localize.translateLocal('fileDownload.success.buttons.ok.text'),
                style: 'cancel',
            },
        ],
    },
    GENERAL_ERROR: {
        title: Localize.translateLocal('fileDownload.generalError.title'),
        message: Localize.translateLocal('fileDownload.generalError.message'),
        options: [
            {
                text: Localize.translateLocal('fileDownload.generalError.buttons.cancel.text'),
                style: 'cancel',
            },
        ],
    },
    PERMISSION_ERROR: {
        title: Localize.translateLocal('fileDownload.permissionError.title'),
        message: Localize.translateLocal('fileDownload.permissionError.message'),
        options: [
            {
                text: Localize.translateLocal('fileDownload.permissionError.buttons.cancel.text'),
                style: 'cancel',
            },
            {
                text: Localize.translateLocal('fileDownload.permissionError.buttons.settings.text'),
                onPress: () => Linking.openSettings(),
            },
        ],
    },
};

export {
    showAlert,
    getAttachmentName,
    getFileType,
    ALERT_TYPES,
};
