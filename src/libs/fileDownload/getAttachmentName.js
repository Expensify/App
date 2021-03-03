import moment from 'moment';

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
