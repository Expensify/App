const SUBMIT_HANDLER = {
    SEARCH_PRE_INSERT: 'searchPreInsert',
    REPORT_PRE_INSERT: 'reportPreInsert',
    DISMISS_MODAL: 'dismissModal',
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
    isSplitRequest: boolean;
    destinationReportID: string | undefined;
    isReportInRHP: boolean;
    isReportTopmostSplit: boolean;
    isSearchTopmostFullScreen: boolean;
    isDestinationReportLoaded: boolean;
};

function canUseDismissModalFastPath(snapshot: SubmitNavigationSnapshot): boolean {
    // Split flows handle their own dismiss/navigation internally (splitBill and
    // splitBillAndOpenReport both call dismissModalAndOpenReportInInboxTab), so
    // dismissing here first would cause double navigation and an orphaned deferred channel.
    if (snapshot.isSplitRequest) {
        return false;
    }

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
 *   isPreInserted && !isReportPreInserted  -> SEARCH_PRE_INSERT
 *   isReportPreInserted                    -> REPORT_PRE_INSERT
 *   canUseDismissModalFastPath()           -> DISMISS_MODAL
 *   isReportInRHP && destinationReportID   -> REPORT_IN_RHP_DISMISS
 *   isFromGlobalCreate && canDismiss       -> SEARCH_DISMISS
 *   else                                   -> DEFAULT
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
    if (snapshot.isReportInRHP && snapshot.destinationReportID && !snapshot.isSplitRequest) {
        return SUBMIT_HANDLER.REPORT_IN_RHP_DISMISS;
    }
    if (snapshot.isFromGlobalCreate && snapshot.canDismissFromSearch && snapshot.isSearchTopmostFullScreen) {
        return SUBMIT_HANDLER.SEARCH_DISMISS;
    }
    return SUBMIT_HANDLER.DEFAULT;
}

export {SUBMIT_HANDLER, getSubmitHandler, canUseDismissModalFastPath};
export type {SubmitHandler, SubmitNavigationSnapshot};
