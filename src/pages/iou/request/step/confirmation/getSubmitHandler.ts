const SUBMIT_HANDLER = {
    SEARCH_PRE_INSERT: 'searchPreInsert',
    REPORT_PRE_INSERT: 'reportPreInsert',
    DISMISS_MODAL: 'dismissModal',
    DISMISS_TO_REPORT: 'dismissToReport',
    REPORT_IN_RHP_DISMISS: 'reportInRHPDismiss',
    SEARCH_DISMISS: 'searchDismiss',
    DEFAULT: 'default',
} as const;

type SubmitHandler = (typeof SUBMIT_HANDLER)[keyof typeof SUBMIT_HANDLER];

type SubmitNavigationSnapshot = {
    isPreInserted: boolean;
    isReportPreInserted: boolean;
    isFromGlobalCreate: boolean;
    canDismissFromSearch: boolean;
    /** Whether the flow navigates to a specific destination report (e.g. SPLIT, TRACK). */
    navigatesToDestinationReport: boolean;
    destinationReportID: string | undefined;
    isReportInRHP: boolean;
    isReportTopmostSplit: boolean;
    isSearchTopmostFullScreen: boolean;
    isDestinationReportLoaded: boolean;
};

function canUseDismissModalFastPath(snapshot: SubmitNavigationSnapshot): boolean {
    // Global create without a report split navigator should go to Search, not dismiss to a report.
    if (snapshot.isFromGlobalCreate && !snapshot.isReportTopmostSplit) {
        return false;
    }

    // Report in RHP needs the dedicated RHP dismiss handler (handleReportInRHPDismiss).
    if (snapshot.isReportInRHP) {
        return false;
    }

    // No Search on top and no destination report - nowhere meaningful to dismiss to.
    if (!snapshot.isSearchTopmostFullScreen && !snapshot.destinationReportID) {
        return false;
    }

    // Destination report isn't loaded in Onyx yet - can't pre-render it, fall through to default.
    if (snapshot.destinationReportID && !snapshot.isDestinationReportLoaded) {
        return false;
    }

    return true;
}

/**
 * Pure decision function: given a snapshot of the current navigation/app state,
 * returns which submit handler should run. No side effects, no Navigation calls.
 *
 * Decision tree (evaluated top to bottom):
 *   isPreInserted && !isReportPreInserted                                       -> SEARCH_PRE_INSERT
 *   isReportPreInserted                                                         -> REPORT_PRE_INSERT
 *   canUseDismissModalFastPath()                                                -> DISMISS_MODAL
 *   isFromGlobalCreate && canDismissFromSearch && isSearchTopmostFullScreen      -> SEARCH_DISMISS
 *   isReportInRHP && destinationReportID                                        -> REPORT_IN_RHP_DISMISS
 *   isFromGlobalCreate && navigatesToDestinationReport && isSearchTopmostFullScreen -> DISMISS_MODAL
 *   isFromGlobalCreate && navigatesToDestinationReport && destinationReportID && isDestinationReportLoaded -> DISMISS_TO_REPORT
 *   else                                                                        -> DEFAULT
 */
function getSubmitHandler(snapshot: SubmitNavigationSnapshot): SubmitHandler {
    if (snapshot.isPreInserted && !snapshot.isReportPreInserted) {
        return SUBMIT_HANDLER.SEARCH_PRE_INSERT;
    }
    if (snapshot.isReportPreInserted) {
        return SUBMIT_HANDLER.REPORT_PRE_INSERT;
    }
    if (canUseDismissModalFastPath(snapshot)) {
        return SUBMIT_HANDLER.DISMISS_MODAL;
    }
    if (snapshot.isFromGlobalCreate && snapshot.canDismissFromSearch && snapshot.isSearchTopmostFullScreen) {
        return SUBMIT_HANDLER.SEARCH_DISMISS;
    }
    if (snapshot.isReportInRHP && snapshot.destinationReportID) {
        return SUBMIT_HANDLER.REPORT_IN_RHP_DISMISS;
    }
    // Covers SPLIT from global create on Spend/Search (canDismissFromSearch is false for SPLIT).
    if (snapshot.isFromGlobalCreate && snapshot.navigatesToDestinationReport && snapshot.isSearchTopmostFullScreen) {
        return SUBMIT_HANDLER.DISMISS_MODAL;
    }
    // Only global-create flows use DISMISS_TO_REPORT: non-global flows (e.g.
    // split from within a report) handle navigation internally and fall through
    // to DEFAULT, which is correct because their submit functions include the
    // dismissModalAndOpenReportInInboxTab call.
    if (snapshot.isFromGlobalCreate && snapshot.navigatesToDestinationReport && snapshot.destinationReportID && snapshot.isDestinationReportLoaded) {
        return SUBMIT_HANDLER.DISMISS_TO_REPORT;
    }
    return SUBMIT_HANDLER.DEFAULT;
}

export {SUBMIT_HANDLER, getSubmitHandler, canUseDismissModalFastPath};
export type {SubmitHandler, SubmitNavigationSnapshot};
