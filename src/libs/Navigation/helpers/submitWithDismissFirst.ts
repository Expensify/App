import {reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {setFastPath, setPendingSubmitFollowUpAction, startTracking} from '@libs/telemetry/submitFollowUpAction';
import type {SubmitExpenseContext} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import getTopmostReportParams from './getTopmostReportParams';
import isSearchTopmostFullScreenRoute from './isSearchTopmostFullScreenRoute';

type WriteOverrides = {
    shouldHandleNavigation: boolean;
    shouldDeferForSearch: boolean;
};

/** Action result the orchestrator dispatches: the write to fire plus the metadata it needs to pick a nav strategy. */
type SubmitEnvelope = {
    executeWrite: (overrides: WriteOverrides) => void;
    destinationReportID: string | undefined;
    telemetryContext: SubmitExpenseContext;
};

/**
 * Required `dispatchEnvelope` param on envelope-producing actions. Forces the caller to consume the envelope —
 * a missing dispatcher is a type error, not a silent no-op. Typically wired to {@link submitEnvelopeWithCleanup}.
 */
type SubmitEnvelopeDispatcher = (envelope: SubmitEnvelope) => void;

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
 * View-layer dismiss-first submit orchestrator. Picks one of four nav strategies, then fires `executeWrite`
 * at the matching moment (after dismiss / after reveal / synchronously):
 *
 *   1. Search topmost            -> dismiss modal, defer write for Search skeleton
 *   2. Destination already shown -> dismiss modal, write after transition
 *   3. Destination loaded        -> reveal destination then dismiss, write after transition
 *   4. Destination not loaded    -> write immediately, then reveal-and-dismiss
 *   5. Fallback                  -> start tracking with default fast path, write with defaults
 *
 * Must not be called from `src/libs/actions/`; action entrypoints return a `SubmitEnvelope` for the UI to dispatch.
 */
function submitWithDismissFirst({executeWrite, destinationReportID, telemetryContext}: SubmitEnvelope): void {
    const shouldStayOnSearch = isSearchTopmostFullScreenRoute();

    if (shouldStayOnSearch) {
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        startDismissFirstTracking(telemetryContext, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
        Navigation.dismissModal({
            afterTransition: () => executeWrite({shouldHandleNavigation: false, shouldDeferForSearch: true}),
        });
        return;
    }

    if (destinationReportID) {
        const isDestinationLoaded = !!getReportOrDraftReport(destinationReportID)?.reportID;
        const currentReportID = !getIsNarrowLayout() ? getTopmostReportParams(navigationRef.getRootState())?.reportID : undefined;
        const isAlreadyOnDestination = currentReportID === destinationReportID;

        if (isAlreadyOnDestination) {
            startDismissFirstTracking(telemetryContext, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, destinationReportID);
            Navigation.dismissModal({
                afterTransition: () => executeWrite({shouldHandleNavigation: false, shouldDeferForSearch: false}),
            });
            return;
        }

        startDismissFirstTracking(telemetryContext, CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        if (!isDestinationLoaded) {
            executeWrite({shouldHandleNavigation: false, shouldDeferForSearch: false});
            Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(destinationReportID));
            return;
        }
        Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(destinationReportID), {
            afterTransition: () => executeWrite({shouldHandleNavigation: false, shouldDeferForSearch: false}),
        });
        return;
    }

    startTracking(telemetryContext, {skipSubmitExpenseSpan: true});
    setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
    executeWrite({shouldHandleNavigation: true, shouldDeferForSearch: false});
}

export {submitWithDismissFirst};
export type {SubmitEnvelope, SubmitEnvelopeDispatcher, WriteOverrides};
