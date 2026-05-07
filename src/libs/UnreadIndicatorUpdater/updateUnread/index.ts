/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import Onyx from 'react-native-onyx';
import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';
import type UpdateUnread from './types';

let unreadTotalCount = 0;
let currentPageTitle = '';
let shouldShowBranchNameInTitle = false;

// This module runs outside of React's component lifecycle (it manages the browser tab title directly),
// so we use Onyx.connectWithoutView instead of the useOnyx hook, which requires a React component context.
Onyx.connectWithoutView({
    key: ONYXKEYS.SHOULD_SHOW_BRANCH_NAME_IN_TITLE,
    callback: (value) => {
        shouldShowBranchNameInTitle = value ?? false;
        updateDocumentTitle();
    },
});

/**
 * Set the current page-specific title (called by useDocumentTitle hook)
 * @param title - The page-specific title
 */
function setPageTitle(title: string) {
    currentPageTitle = title;
    updateDocumentTitle();
}

/**
 * Synchronous on purpose. Deferring (setTimeout/queueMicrotask) loses a race with React Navigation's
 * createMemoryHistory popstate handler, which captures and re-asserts document.title — re-applying
 * the stale value if our write hasn't landed yet.
 */
function updateDocumentTitle() {
    if (typeof document === 'undefined') {
        return;
    }
    const hasUnread = unreadTotalCount !== 0;

    // Chrome reverts the tab title to the previous entry on back navigation; blanking it first forces a refresh.
    document.title = '';
    const baseTitle = currentPageTitle || CONFIG.SITE_TITLE;
    const titleWithUnread = hasUnread ? `(${unreadTotalCount}) ${baseTitle}` : baseTitle;
    document.title = shouldShowBranchNameInTitle && __GIT_BRANCH__ ? `[${__GIT_BRANCH__}] ${titleWithUnread}` : titleWithUnread;

    const favicon = document.getElementById('favicon');
    if (favicon instanceof HTMLLinkElement) {
        favicon.href = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;
    }
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
