import {Alert} from 'react-native';
import moment from 'moment';

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
export default function getAttachmentName(url) {
    if (!url) {
        return '';
    }
    return `${moment().format('DDMMYYYYHHmmss')}.${url.split(/[#?]/)[0].split('.').pop().trim()}`;
}

export {
    showAlert,
    getAttachmentName,
};
