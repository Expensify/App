/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '@src/CONFIG';
import type UpdateUnread from './types';

let unreadTotalCount = 0;
let currentPageTitle = '';
let pendingTitleUpdate: ReturnType<typeof setTimeout> | null = null;

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
 * Update the actual document title and favicon.
 *
 * Debounced so that only the last call in a burst (popstate + navigation
 * state listener + useFocusEffect) actually runs.  This prevents the
 * visible blank-title flash that occurred when multiple calls each
 * executed `document.title = ''` followed by the real title in separate
 * setTimeout(0) callbacks.
 */
function updateDocumentTitle() {
    if (pendingTitleUpdate !== null) {
        clearTimeout(pendingTitleUpdate);
    }

    // This setTimeout is required because due to how react rendering messes with the DOM, the document title can't be modified synchronously, and we must wait until all JS is done
    // running before setting the title.
    pendingTitleUpdate = setTimeout(() => {
        pendingTitleUpdate = null;
        const hasUnread = unreadTotalCount !== 0;

        // There is a Chrome browser bug that causes the title to revert back to the previous when we are navigating back. Setting the title to an empty string
        // seems to improve this issue.
        document.title = '';

        // Use page-specific title if available, otherwise use the default SITE_TITLE
        const baseTitle = currentPageTitle || CONFIG.SITE_TITLE;
        document.title = hasUnread ? `(${unreadTotalCount}) ${baseTitle}` : baseTitle;

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
    updateUnread(unreadTotalCount);
});

export default updateUnread;
export {setPageTitle};