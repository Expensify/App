import CONST from '../../CONST';
import replaceSourceOrigin from '../replaceSourceOrigin';

/**
 * Extract the thumbnail URL, source URL and the original filename from the HTML.
 * @param {String} html
 * @returns {Object}
 */
export default function getAttachmentName(html) {
    // Files can be rendered either as anchor tag or as an image so based on that we have to form regex.
    const IS_IMAGE_TAG = /<img([\w\W]+?)\/>/i.test(html);
    const PREVIEW_SOURCE_REGEX = new RegExp(`${CONST.ATTACHMENT_PREVIEW_ATTRIBUTE}*=*"(.+?)"`, 'i');
    const SOURCE_REGEX = new RegExp(`${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}*=*"(.+?)"`, 'i');
    const ORIGINAL_FILENAME_REGEX = IS_IMAGE_TAG ? new RegExp(`${CONST.ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE}*=*"(.+?)"`, 'i') : new RegExp('<a[^>]*>([^<]+)</a>', 'i');
    if (!html) {
        return {
            previewSourceURL: null,
            sourceURL: null,
            originalFileName: null,
        };
    }
    const sourceURL = replaceSourceOrigin(html.match(SOURCE_REGEX)[1]);
    const imageURL = IS_IMAGE_TAG && replaceSourceOrigin(html.match(PREVIEW_SOURCE_REGEX)[1]);
    const previewSourceURL = IS_IMAGE_TAG ? imageURL : sourceURL;
    const originalFileName = html.match(ORIGINAL_FILENAME_REGEX)[1];

    // Update the image URL so the images can be accessed depending on the config environment
    return {
        previewSourceURL,
        sourceURL,
        originalFileName,
    };
}
