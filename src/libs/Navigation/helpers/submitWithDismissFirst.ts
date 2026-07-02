// Dismiss-first submit orchestration for skip-confirmation paths (QAB amount, scan/distance). Confirmation-step flows use SubmitExpenseOrchestrator instead.
import {reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {setFastPath, setPendingSubmitFollowUpAction, startTracking} from '@libs/telemetry/submitFollowUpAction';
import type {SubmitExpenseContext} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import getTopmostReportParams from './getTopmostReportParams';
import isReportTopmostSplitNavigator from './isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type WriteOverrides = {
    shouldHandleNavigation: boolean;
};

type SubmitWithDismissFirstParams = {
    /** The pure write to fire when the orchestrator decides the modal/route timing is right. */
    executeWrite: (overrides: WriteOverrides) => void;
    /** Report the orchestrator will reveal/dismiss to before the write fires. */
    destinationReportID: string | undefined;
    /** Telemetry metadata for the submit-expense performance span. */
    telemetryContext: SubmitExpenseContext;
};

function startDismissFirstTracking(
    telemetryContext: SubmitExpenseContext,
    followUpAction: typeof CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT | typeof CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
    pendingReportID?: string,
) {
    startTracking(telemetryContext, {skipSubmitExpenseSpan: true});
    setFastPath(
        followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT
            ? CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_TO_REPORT
            : CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_MODAL,
        CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST,
    );
    setPendingSubmitFollowUpAction(followUpAction, pendingReportID);
}

/**
 * View-layer dismiss-first submit orchestrator. Picks one of five nav strategies, then fires `executeWrite`
 * at the matching moment (after dismiss / after reveal / synchronously):
 *
 *   1. Search topmost            -> dismiss modal, defer write for Search skeleton
 *   2. Route pre-inserted        -> dismiss modal, write after transition (route already staged)
 *   3. Destination already shown -> dismiss modal, write after transition
 *   4. Destination loaded        -> reveal destination then dismiss, write after transition
 *   5. Destination not loaded    -> write immediately, then reveal-and-dismiss
 *   6. Fallback                  -> start tracking with default fast path, write with defaults
 *
 * Must not be called from `src/libs/actions/` — view-layer only.
 */
function submitWithDismissFirst({executeWrite, destinationReportID, telemetryContext}: SubmitWithDismissFirstParams): void {
    const shouldStayOnSearch = isSearchTopmostFullScreenRoute();

    if (shouldStayOnSearch) {
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        startDismissFirstTracking(telemetryContext, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
        Navigation.dismissModal({
            afterTransition: () => executeWrite({shouldHandleNavigation: false}),
        });
        return;
    }

    if (Navigation.getIsFullscreenPreInsertedUnderRHP()) {
        Navigation.clearFullscreenPreInsertedFlag();
        startDismissFirstTracking(telemetryContext, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        Navigation.dismissModal({
            afterTransition: () => executeWrite({shouldHandleNavigation: false}),
        });
        return;
    }

    if (destinationReportID) {
        const isDestinationLoaded = !!getReportOrDraftReport(destinationReportID)?.reportID;
        const isNarrow = getIsNarrowLayout();
        const isReportVisible = !isNarrow && isReportTopmostSplitNavigator();
        const currentReportID = isReportVisible ? getTopmostReportParams(navigationRef.getRootState())?.reportID : undefined;
        const isAlreadyOnDestination = currentReportID === destinationReportID;

        if (isAlreadyOnDestination) {
            startDismissFirstTracking(telemetryContext, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, destinationReportID);
            Navigation.dismissModal({
                afterTransition: () => executeWrite({shouldHandleNavigation: false}),
            });
            return;
        }

        startDismissFirstTracking(telemetryContext, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        if (!isDestinationLoaded) {
            executeWrite({shouldHandleNavigation: false});
            Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(destinationReportID));
            return;
        }
        Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(destinationReportID), {
            afterTransition: () => executeWrite({shouldHandleNavigation: false}),
        });
        return;
    }

    // Fallback: no fast-path nav applies — start tracking so telemetry isn't silently skipped.
    startTracking(telemetryContext, {skipSubmitExpenseSpan: true});
    setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
    executeWrite({shouldHandleNavigation: true});
}

export {submitWithDismissFirst};
export type {WriteOverrides};
