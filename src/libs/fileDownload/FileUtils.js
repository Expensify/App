import {Alert, Linking} from 'react-native';
import moment from 'moment';
import * as mime from 'react-native-mime-types';
import CONST from '../../CONST';

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
        title: 'Downloaded!',
        message: 'Attachment successfully downloaded',
        options: [
            {
                text: 'OK',
                style: 'cancel',
            },
        ],
    },
    GENERAL_ERROR: {
        title: 'Attachment Error',
        message: 'Attachment cannot be downloaded',
        options: [
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ],
    },
    PERMISSION_ERROR: {
        title: 'Access Needed',
        // eslint-disable-next-line max-len
        message: 'NewExpensify does not have access to save attachments. To enable access, tap Settings and allow access.',
        options: [
            {
                text: 'Cancel',
                style: 'cancel',
            },
            {
                text: 'Settings',
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
