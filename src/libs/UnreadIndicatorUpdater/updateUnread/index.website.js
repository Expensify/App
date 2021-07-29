/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '../../../CONFIG';

/**
 * Set the page title on web
 *
 * @param {Number} totalCount
 */
function updateUnread(totalCount) {
    const hasUnread = totalCount !== 0;
    document.title = hasUnread ? `(${totalCount}) ${CONFIG.SITE_TITLE}` : CONFIG.SITE_TITLE;
    document.getElementById('favicon').href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;
}

export default updateUnread;
