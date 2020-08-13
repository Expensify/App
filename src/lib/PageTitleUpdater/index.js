/**
 * Web browsers have a tab title which can be updated to show there are unread comments
 */
import CONFIG from '../../CONFIG';

/**
 * Updates the title of the current browser tab with an unread count indicator
 *
 * @param {boolean} hasUnread
 */
const PageTitleUpdater = (hasUnread) => {
    document.title = hasUnread ? `(NEW!) ${CONFIG.SITE_TITLE}` : CONFIG.SITE_TITLE;
};

export default PageTitleUpdater;
