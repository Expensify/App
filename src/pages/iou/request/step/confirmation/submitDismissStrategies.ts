import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getTopmostReportParams from '@libs/Navigation/helpers/getTopmostReportParams';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {endSubmitFollowUpActionSpan, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';

function dismissOnly(runAfterDismiss: () => void) {
    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
    Navigation.dismissModal({
        afterTransition: () => {
            endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            runAfterDismiss();
        },
    });
}

// runAfterDismiss (and therefore the API write) is gated on TransitionTracker rather than on this
// navigation's own callback, because dismissModalWithReport has no afterTransition hook. The write's
// barrier was armed by the caller before this ran, so it releases with the same transition.
function dismissNarrowWithReport(reportID: string, runAfterDismiss: () => void) {
    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
    Navigation.dismissModalWithReport({reportID}, undefined, {
        onBeforeNavigate: (willOpenReport) => {
            if (willOpenReport) {
                setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID);
                return;
            }

            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
        },
    });
    TransitionTracker.runAfterTransitions({
        callback: runAfterDismiss,
        waitForUpcomingTransition: true,
    });
}

function dismissWideToSameReport(reportID: string, runAfterDismiss: () => void) {
    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
    Navigation.dismissModal({
        afterTransition: () => {
            endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
            runAfterDismiss();
        },
    });
}

function dismissWideToNewReport(reportID: string, runAfterDismiss: () => void) {
    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID);
    Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(reportID), {
        afterTransition: runAfterDismiss,
    });
}

function dismissSuperWideRHP(destinationReportID: string | undefined, runAfterDismiss: () => void) {
    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, destinationReportID);
    Navigation.dismissToPreviousRHP({
        afterTransition: runAfterDismiss,
    });
}

function dismissRHPToReport(reportID: string, runAfterDismiss: () => void) {
    const report = getReportOrDraftReport(reportID);
    const hasExistingTransactions = isMoneyRequestReport(report) && report?.transactionCount !== 0;

    if (!hasExistingTransactions) {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
        const rootState = navigationRef.getRootState();
        const rhpKey = rootState?.routes?.at(-1)?.state?.key;
        if (rhpKey) {
            Navigation.pop(rhpKey);
        }
        TransitionTracker.runAfterTransitions({
            callback: runAfterDismiss,
            waitForUpcomingTransition: true,
        });
        return;
    }

    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID);
    const isNarrowLayout = getIsNarrowLayout();
    if (isNarrowLayout) {
        Navigation.dismissModal();
    } else {
        Navigation.dismissToPreviousRHP();
    }
    Navigation.setNavigationActionToMicrotaskQueue(() => {
        Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}), {forceReplace: !isNarrowLayout});
    });
    TransitionTracker.runAfterTransitions({
        callback: runAfterDismiss,
        waitForUpcomingTransition: true,
    });
}

// Wide layout: swap the visible Search tab to the correct type while the
// modal slides away, so the user never sees the wrong tab underneath.
function dismissWideToNewSearchType(searchType: SearchDataTypes, runAfterDismiss: () => void) {
    const queryString = buildCannedSearchQuery({type: searchType});
    Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {
        afterTransition: runAfterDismiss,
    });
}

/**
 * Resolves the dismiss strategy for the DISMISS_MODAL fast-path handler based
 * on current layout and navigation state.
 */
function executeDismissModalStrategy(destinationReportID: string | undefined, runAfterDismiss: () => void) {
    if (!destinationReportID) {
        dismissOnly(runAfterDismiss);
        return;
    }

    if (isSearchTopmostFullScreenRoute()) {
        dismissOnly(runAfterDismiss);
        return;
    }

    if (getIsNarrowLayout()) {
        dismissNarrowWithReport(destinationReportID, runAfterDismiss);
        return;
    }

    const currentReportID = getTopmostReportParams(navigationRef.getRootState())?.reportID;
    if (currentReportID === destinationReportID) {
        dismissWideToSameReport(destinationReportID, runAfterDismiss);
        return;
    }

    dismissWideToNewReport(destinationReportID, runAfterDismiss);
}

export {dismissOnly, dismissSuperWideRHP, dismissRHPToReport, dismissWideToNewSearchType, executeDismissModalStrategy};
