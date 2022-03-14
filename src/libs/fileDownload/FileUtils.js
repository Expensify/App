import {Alert} from 'react-native';
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
 * Returns file type based on the filename/uri
 * @param {String} fileName
 * @returns {String}
 */

function getFileType(fileName) {
    if (!fileName) {
        return;
    }
    const contentType = mime.contentType(fileName);
    if (contentType.startsWith('image')) {
        return CONST.ATTACHMENT_FILE_TYPE.IMAGE;
    }
    if (contentType.startsWith('video')) {
        return CONST.ATTACHMENT_FILE_TYPE.VIDEO;
    }
    return CONST.ATTACHMENT_FILE_TYPE.FILE;
}

export {
    showAlert,
    getAttachmentName,
    getFileType,
};
