/**
 * Shared orchestration for the "dismiss-first" submit optimization.
 *
 * Multiple expense submit flows (scan, distance, manual, split, pay, track)
 * follow the same 3-branch navigation pattern after collecting input:
 *
 *   1. Search is topmost -> dismiss modal, defer write for Search skeleton
 *   2. Destination report exists -> reveal it before/during dismiss, then write
 *   3. Fallback -> write immediately with telemetry (caller handles its own navigation)
 *
 * This module centralizes the telemetry setup + navigation branching so each
 * call site only needs to describe *what* to write and *where* it should land.
 *
 * **Relationship with SubmitExpenseOrchestrator:**
 * This is the simplified variant for skip-confirmation paths (QAB amount entry,
 * scan without confirmation, distance without confirmation). It handles a 3-branch
 * decision (Search / destination report / fallback). The full-featured orchestrator
 * in `SubmitExpenseOrchestrator.tsx` handles confirmation-step flows with a richer
 * decision tree (pre-inserts, RHP dismiss, search dismiss, etc.) via `getSubmitHandler`.
 * Both share the same telemetry primitives (`startTracking`, `setFastPath`,
 * `setPendingSubmitFollowUpAction`) to ensure consistent span instrumentation.
 */
import {reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import getTopmostReportParams from '@libs/Navigation/helpers/getTopmostReportParams';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {setFastPath, setPendingSubmitFollowUpAction, startTracking} from '@libs/telemetry/submitFollowUpAction';
import type {SubmitExpenseContext} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';

/**
 * Overrides passed into `executeWrite` by the orchestration layer.
 *
 * When called by `submitWithDismissFirst`, both fields are always provided
 * with explicit values so callers don't need `?? true` guards. When used
 * directly by action helpers (e.g. MoneyRequest.ts) the fields are optional
 * to allow `= {}` defaults.
 */
type WriteOverrides = {
    shouldHandleNavigation?: boolean;
    shouldDeferForSearch?: boolean;
};

type DismissFirstSubmitOptions = {
    /** The API write function to execute; receives navigation/defer overrides from the orchestrator. */
    executeWrite: (overrides?: WriteOverrides) => void;
    /** Report that will display the expense after submission (used to pick the dismiss target). */
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
 * Orchestrates the dismiss-first submit pattern. Picks the best navigation
 * strategy and executes the write — every branch starts telemetry tracking.
 *
 *   1. Search is topmost -> dismiss modal, defer write for Search skeleton
 *   2. Destination report exists -> reveal it before/during dismiss, then write
 *   3. Neither -> start tracking with default fast path, call executeWrite with defaults
 */
function submitWithDismissFirst({executeWrite, destinationReportID, telemetryContext}: DismissFirstSubmitOptions): void {
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

    // Fallback: no fast-path navigation applies. Start tracking so telemetry
    // is never silently skipped, then execute the write with defaults.
    startTracking(telemetryContext, {skipSubmitExpenseSpan: true});
    setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
    executeWrite({shouldHandleNavigation: true, shouldDeferForSearch: false});
}

export {submitWithDismissFirst};
export type {DismissFirstSubmitOptions, WriteOverrides};
