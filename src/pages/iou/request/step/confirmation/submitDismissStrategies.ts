import type {SpanAttributeValue} from '@sentry/core';
import {flushDeferredWrite} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getTopmostFullScreenRoute from '@libs/Navigation/helpers/getTopmostFullScreenRoute';
import getTopmostReportParams from '@libs/Navigation/helpers/getTopmostReportParams';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import {buildCannedSearchQuery} from '@libs/SearchQueryUtils';
import {endSubmitFollowUpActionSpan, hasSubmitSpan, setPendingSubmitFollowUpAction, setSubmitSpanAttributes} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import getTabNavigatorDiagnostics from './getTabNavigatorDiagnostics';

function dismissOnly(runAfterDismiss: () => void) {
    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
    Navigation.dismissModal({
        afterTransition: () => {
            endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            runAfterDismiss();
        },
    });
}

/** Builds root route count and topmost fullscreen route name attributes for the narrow dismiss diagnostic. */
function buildDismissNarrowDiagnostics(): Record<string, SpanAttributeValue> {
    const prefix = CONST.TELEMETRY.SUBMIT_SPAN.DISMISS_NARROW_PREFIX;
    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return {};
    }
    return {
        [`${prefix}root_route_count`]: rootState.routes.length,
        [`${prefix}topmost_fullscreen`]: getTopmostFullScreenRoute()?.name ?? CONST.TELEMETRY.ATTRIBUTE_VALUE_UNAVAILABLE,
    };
}

// Flush ordering: The DISMISS_MODAL deferred-write channel is flushed by
// ReportScreen.useFlushDeferredWriteOnFocus (on focus gain) or TransitionTracker (wide layout
// fallback). createTransaction (via runAfterDismiss) calls deferOrExecuteWrite
// which either registers the write on the channel or executes immediately:
//   - Focus fires first -> flushRequested is set -> deferOrExecuteWrite executes immediately
//   - TransitionTracker fires first -> write is registered -> focus flush executes it later
// Both orderings are correct. The 5s safety timeout in deferredLayoutWrite covers
// edge cases where neither trigger fires (e.g. ReportScreen never mounts).
function dismissNarrowWithReport(reportID: string, runAfterDismiss: () => void) {
    if (hasSubmitSpan()) {
        setSubmitSpanAttributes(buildDismissNarrowDiagnostics());
    }

    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
    Navigation.dismissModalWithReport({reportID}, undefined, {
        onBeforeNavigate: (willOpenReport) => {
            setSubmitSpanAttributes({[`${CONST.TELEMETRY.SUBMIT_SPAN.DISMISS_NARROW_PREFIX}will_open_report`]: willOpenReport});
            setPendingSubmitFollowUpAction(
                willOpenReport ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
                reportID,
            );
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
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            runAfterDismiss();
        },
    });
}

function dismissWideToNewReport(reportID: string, runAfterDismiss: () => void) {
    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID);
    Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(reportID), {
        afterTransition: () => {
            flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            runAfterDismiss();
        },
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

/** Captures split navigator and tab state at dismiss time for the report_pre_insert diagnostic. */
function buildAtDismissAttributes(formSubmitted: boolean): Record<string, SpanAttributeValue> {
    const prefix = CONST.TELEMETRY.SUBMIT_SPAN.AT_DISMISS_PREFIX;
    const {tabNavigatorStateAvailable, tabActiveName, activeTabState} = getTabNavigatorDiagnostics();
    const attrs: Record<string, SpanAttributeValue> = {
        [`${prefix}form_has_been_submitted`]: formSubmitted,
        [`${prefix}tab_active_name`]: tabActiveName ?? CONST.TELEMETRY.ATTRIBUTE_VALUE_UNAVAILABLE,
    };

    if (!tabNavigatorStateAvailable || !activeTabState) {
        return attrs;
    }

    attrs[`${prefix}split_route_count`] = activeTabState.routes.length;
    const lastSplitRoute = activeTabState.routes.at(-1);
    if (!lastSplitRoute) {
        return attrs;
    }

    attrs[`${prefix}split_last_route`] = lastSplitRoute.name;
    // Route params are typed per-navigator, but the split route is resolved dynamically
    // from nested state — the type system can't narrow it. Runtime typeof check below.
    const params = lastSplitRoute.params as Record<string, unknown> | undefined;
    const reportID = typeof params?.reportID === 'string' ? params.reportID : undefined;
    if (reportID) {
        attrs[`${prefix}split_last_report_id`] = reportID;
    }

    return attrs;
}

export {buildAtDismissAttributes, dismissOnly, dismissSuperWideRHP, dismissRHPToReport, dismissWideToNewSearchType, executeDismissModalStrategy};
