/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '@src/CONFIG';
import type UpdateUnread from './types';

let unreadTotalCount = 0;
let currentPageTitle = '';

/**
 * Set the current page-specific title (called by useDocumentTitle hook)
 * @param title - The page-specific title
 */
function setPageTitle(title: string) {
    currentPageTitle = title;
    // Immediately update the document title when page title changes
    updateDocumentTitle();
}

/**
 * Update the actual document title and favicon
 */
function updateDocumentTitle() {
    const hasUnread = unreadTotalCount !== 0;
    // This setTimeout is required because due to how react rendering messes with the DOM, the document title can't be modified synchronously, and we must wait until all JS is done
    // running before setting the title.
    setTimeout(() => {
        // Use page-specific title if available, otherwise use the default SITE_TITLE
        const baseTitle = currentPageTitle || CONFIG.SITE_TITLE;
        const newTitle = hasUnread ? `(${unreadTotalCount}) ${baseTitle}` : baseTitle;

        // Only update if the title actually changed to avoid flicker during navigation
        if (document.title !== newTitle) {
            document.title = newTitle;
        }

        const favicon = document.getElementById('favicon');
        if (favicon instanceof HTMLLinkElement) {
            favicon.href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;
        }
    }, 0);
}

/**
 * Set the page title on web
 */
const updateUnread: UpdateUnread = (totalCount) => {
    unreadTotalCount = totalCount;
    updateDocumentTitle();
};

window.addEventListener('popstate', () => {
    // Workaround for Chrome bug: briefly clear title on back navigation
    // so the browser doesn't show the stale title from history
    document.title = '';
    updateUnread(unreadTotalCount);
});

export default updateUnread;
export {setPageTitle};
