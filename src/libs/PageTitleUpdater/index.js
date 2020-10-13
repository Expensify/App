/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '../../CONFIG';

/**
 * Updates the title and favicon of the current browser tab with an unread indicator
 *
 * @param {boolean} hasUnread
 */
const PageTitleUpdater = (hasUnread) => {
    document.title = hasUnread ? `(NEW!) ${CONFIG.SITE_TITLE}` : CONFIG.SITE_TITLE;
    document.getElementById('favicon').href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;
};

export default PageTitleUpdater;
