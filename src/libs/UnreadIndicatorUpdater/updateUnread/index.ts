/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import CONFIG from '@src/CONFIG';
import type UpdateUnread from './types';

let unreadTotalCount = 0;
let currentPageTitle = '';
let pendingUpdateId = 0;

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
 * Deduplicates multiple rapid calls within the same frame to prevent
 * the browser from rendering intermediate empty/incorrect titles during navigation.
 */
function updateDocumentTitle() {
    const hasUnread = unreadTotalCount !== 0;
    // Cancel any previously scheduled update to avoid duplicate title changes
    // that cause the browser tab title to flicker during page transitions.
    pendingUpdateId += 1;
    const currentUpdateId = pendingUpdateId;

    // This setTimeout is required because due to how react rendering messes with the DOM, the document title can't be modified synchronously, and we must wait until all JS is done
    // running before setting the title.
    setTimeout(() => {
        // Skip if a newer update was scheduled after this one
        if (currentUpdateId !== pendingUpdateId) {
            return;
        }

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
