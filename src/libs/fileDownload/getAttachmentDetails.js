import CONST from '../../CONST';
import Config from '../../CONFIG';

/**
 * Extract the thumbnail URL, source URL and the original filename from the HTML.
 * @param {String} html
 * @returns {Object}
 */
const PREVIEW_SOURCE_REGEX = new RegExp(`${CONST.ATTACHMENT_PREVIEW_ATTRIBUTE}*=*"(.+?)"`, 'i');
const SOURCE_REGEX = new RegExp(`${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}*=*"(.+?)"`, 'i');
const ORIGINAL_FILENAME_REGEX = new RegExp(`${CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE}*=*"(.+?)"`, 'i');

export default function getAttachmentName(html) {
    if (!html) {
        return {
            previewSourceURL: null,
            sourceURL: null,
            originalFileName: null,
        };
    }
    const previewSourceURL = html.match(PREVIEW_SOURCE_REGEX)[1].replace(
        Config.EXPENSIFY.EXPENSIFY_URL,
        Config.EXPENSIFY.URL_API_ROOT,
    );
    const sourceURL = html.match(SOURCE_REGEX)[1].replace(
        Config.EXPENSIFY.EXPENSIFY_URL,
        Config.EXPENSIFY.URL_API_ROOT,
    );
    const originalFileName = html.match(ORIGINAL_FILENAME_REGEX)[1];

    // Update the image URL so the images can be accessed depending on the config environment
    return {
        previewSourceURL,
        sourceURL,
        originalFileName,
    };
}
