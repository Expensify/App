/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '@src/CONFIG';
import type UpdateUnread from './types';

let unreadTotalCount = 0;
/**
 * Set the page title on web
 */
const updateUnread: UpdateUnread = (totalCount) => {
    const hasUnread = totalCount !== 0;
    unreadTotalCount = totalCount;
    const regex = /^\(\d+\)\s/; // Matches "(number) " at the start of the string
    // This setTimeout is required because due to how react rendering messes with the DOM, the document title can't be modified synchronously, and we must wait until all JS is done
    // running before setting the title.
    setTimeout(() => {
        let currentTitle = document.title;
        const unreadCountString = hasUnread ? `(${totalCount}) ` : '';
        if (regex.test(currentTitle)) {
            currentTitle = currentTitle.replace(regex, unreadCountString);
        } else if (hasUnread) {
            currentTitle = unreadCountString + currentTitle;
        }

        document.title = currentTitle;
        const favicon = document.getElementById('favicon');
        if (favicon instanceof HTMLLinkElement) {
            favicon.href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;
        }
    }, 0);
};

window.addEventListener('popstate', () => {
    updateUnread(unreadTotalCount);
});

function getUnreadTotalCount() {
    return unreadTotalCount;
}
export {getUnreadTotalCount};
export default updateUnread;
