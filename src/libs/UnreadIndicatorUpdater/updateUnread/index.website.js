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

    // This setTimeout is required because due to how react rendering messes with the DOM, the document title can't be modified synchronously, and we must wait until all JS is done
    // running before setting the title.
    setTimeout(() => {
        // There is a Chrome browser bug that causes the title to revert back to the previous when we are navigating back. Setting the title to an empty string
        // seems to improve this issue.
        document.title = '';
        document.title = hasUnread ? `(${totalCount}) ${CONFIG.SITE_TITLE}` : CONFIG.SITE_TITLE;
        document.getElementById('favicon').href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;
    }, 0);
}

export default updateUnread;
