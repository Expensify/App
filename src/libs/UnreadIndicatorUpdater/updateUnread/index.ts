import CONFIG from '@src/CONFIG';
import ONYXKEYS from '@src/ONYXKEYS';

/**
 * Web browsers have a tab title and favicon which can be updated to show there are unread comments
 */
import Onyx from 'react-native-onyx';

import type UpdateUnread from './types';

let unreadTotalCount = 0;
let unreadReportIDs = new Set<string>();
let hasStreamingConciergeResponse = false;
let completedConciergeReportIDs: string[] = [];
let pendingConciergeReportIDs: string[] = [];
let requestUnreadUpdate: (() => void) | undefined;
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

function shouldShowConciergeFavicon() {
    return hasStreamingConciergeResponse || pendingConciergeReportIDs.length > 0 || completedConciergeReportIDs.some((reportID) => unreadReportIDs.has(reportID));
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
        const defaultIcon = hasUnread ? CONFIG.FAVICON.UNREAD : CONFIG.FAVICON.DEFAULT;
        // Completed replies follow the same report eligibility and read state as the ordinary icon.
        favicon.href = shouldShowConciergeFavicon() ? CONFIG.FAVICON.CONCIERGE_UNREAD : defaultIcon;
    }
}

/**
 * Set the page title on web
 */
const updateUnread: UpdateUnread = (totalCount, reportIDs = []) => {
    unreadTotalCount = totalCount;
    unreadReportIDs = new Set(reportIDs);
    pendingConciergeReportIDs = [];
    updateDocumentTitle();
};

function setUnreadUpdateCallback(callback: () => void) {
    requestUnreadUpdate = callback;
}

window.addEventListener('popstate', () => {
    updateDocumentTitle();
});

function setConciergeAttention(isStreaming: boolean, completedReportIDs: string[]) {
    const hadAttention = shouldShowConciergeFavicon();
    const wasStreaming = hasStreamingConciergeResponse;
    hasStreamingConciergeResponse = isStreaming;
    completedConciergeReportIDs = completedReportIDs;
    pendingConciergeReportIDs = pendingConciergeReportIDs.filter((reportID) => completedReportIDs.includes(reportID));
    if (wasStreaming && !isStreaming && completedReportIDs.length > 0) {
        // Commit the completed state with a fresh ordinary unread snapshot, rather than
        // briefly clearing the icon against IDs from before the debounced report update.
        pendingConciergeReportIDs = completedReportIDs;
        requestUnreadUpdate?.();
    }
    if (hadAttention === shouldShowConciergeFavicon()) {
        return;
    }
    updateDocumentTitle();
}

export default updateUnread;
export {setPageTitle, setConciergeAttention, setUnreadUpdateCallback};
