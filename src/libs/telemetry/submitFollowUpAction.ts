/**
 * Submit follow-up action span: measures time from expense submit until the follow-up action
 * (e.g. dismiss modal and open report, dismiss modal only, navigate to search) is complete and the target screen is visible.
 * Uses submit_follow_up_action attribute to record which action was taken.
 *
 * Also manages the tracking session state (fast path handler, optimizations, structured log)
 * for the full submit-to-destination-visible telemetry lifecycle.
 *
 * "Fast path" = modal dismissed before createTransaction (dismiss first, compute later).
 * "Slow path" = createTransaction in the critical path before navigation (default handler).
 */
import type {SpanAttributeValue} from '@sentry/core';
import type {ValueOf} from 'type-fest';
import Log from '@libs/Log';
import getActiveTabName from '@libs/Navigation/helpers/getActiveTabName';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import navigationRef from '@libs/Navigation/navigationRef';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import {cancelSpan, endSpanWithAttributes, getSpan, startSpan} from './activeSpans';

type SubmitFollowUpAction = ValueOf<typeof CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION>;

type PendingSubmitFollowUpAction = {
    followUpAction: SubmitFollowUpAction;
    reportID?: string;
} | null;

type FastPathType = ValueOf<typeof CONST.TELEMETRY.FAST_PATH_HANDLER>;

type SubmitExpenseContext = {
    scenario: string;
    iouType: string;
    requestType: string;
    isFromGlobalCreate: boolean;
    hasReceipt: boolean;
};

type StartTrackingOptions = {
    skipSubmitExpenseSpan?: boolean;
};

type Optimization = ValueOf<typeof CONST.TELEMETRY.SUBMIT_OPTIMIZATION>;

type TrackingState = {
    context: SubmitExpenseContext;
    fastPath: FastPathType | null;
    optimizations: Set<Optimization>;
    startTime: number;
    skipSubmitExpenseSpan: boolean;
};

// No real expense submit flow should take longer than this from button press
// to destination visible. Anything beyond this is a stuck span (e.g. user
// backgrounded mid-flow, destination screen never mounted, focus never fired).
const SPAN_SAFETY_TIMEOUT_MS = 60_000;

// Module-level mutable state. Safe because JS is single-threaded: each
// mutation runs to completion before any queued rAF callback can execute.
// startTracking() calls cancelTracking() first, ensuring a clean slate
// even if the previous flow's async callbacks haven't fired yet.
let trackingState: TrackingState | null = null;
let pendingSubmitFollowUpAction: PendingSubmitFollowUpAction = null;
let safetyTimeoutId: ReturnType<typeof setTimeout> | null = null;
let navListenerRegistered = false;

// ---------------------------------------------------------------------------
// Follow-up action state
// ---------------------------------------------------------------------------

/**
 * True when the new call is a refinement of the same submit flow (same report, same or more specific action).
 * In that case we update pending and span attributes instead of cancelling, so the second setPending call in the same flow does not drop the span.
 */
function isSameFlowUpdate(pending: NonNullable<PendingSubmitFollowUpAction>, followUpAction: SubmitFollowUpAction, reportID?: string): boolean {
    if (pending.reportID !== reportID) {
        return false;
    }
    if (pending.followUpAction === followUpAction) {
        return true;
    }
    // Refinement: we first set DISMISS_MODAL_ONLY, then dismissModalWithReport's onBeforeNavigate refines it to DISMISS_MODAL_AND_OPEN_REPORT when the report will open. Same flow - update in place instead of cancelling.
    if (pending.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY && followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT) {
        return true;
    }
    // The fast path (pre-insert) sets NAVIGATE_TO_SEARCH before createTransaction runs.
    // handleNavigateAfterExpenseCreate may later call with DISMISS_MODAL_ONLY because it
    // sees the Search page as already on top. Treat this as same-flow - keep the original.
    return pending.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH && followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY;
}

/**
 * Set the pending follow-up action before navigating (for submit-to-visible span).
 * The screen that becomes visible should call endSubmitFollowUpActionSpan when visible.
 * If there is already a pending action and the span is still running (e.g. second submit before first completes), we cancel the previous span so it is not left stuck or attributed to the wrong action.
 * Exception: when the new call is a same-flow update (same report, same or refined action), we just update pending and span attributes without cancelling.
 */
function setPendingSubmitFollowUpAction(followUpAction: SubmitFollowUpAction, reportID?: string) {
    const span = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    const pending = pendingSubmitFollowUpAction;

    if (pending !== null && span && isSameFlowUpdate(pending, followUpAction, reportID)) {
        // Same flow: only update when the new action is a genuine refinement (e.g.
        // DISMISS_MODAL_ONLY -> DISMISS_MODAL_AND_OPEN_REPORT). When the fast path set
        // NAVIGATE_TO_SEARCH and handleNavigateAfterExpenseCreate later calls with
        // DISMISS_MODAL_ONLY (because Search is already on top), preserve the original
        // action so telemetry correctly reflects the pre-insert path.
        const isRefinement =
            pending.followUpAction !== followUpAction &&
            !(pending.followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH && followUpAction === CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);

        if (isRefinement) {
            pendingSubmitFollowUpAction = {followUpAction, reportID};
            span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION, followUpAction);
            if (reportID !== undefined) {
                span.setAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORT_ID, reportID);
            }
        }
        return;
    }

    if (pending !== null && span) {
        cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
        pendingSubmitFollowUpAction = null;
    }

    // Only set pending when the span is still active. On the fast path the span
    // may have already been ended by SearchStaticList before createTransaction's
    // rAF fires. Setting pending without a span leaves stale state that would
    // cancel the next flow's span in the conflict check above.
    // Re-read the span after the cancel above since cancelSpan may have cleared it.
    const activeSpan = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    if (!activeSpan) {
        return;
    }

    pendingSubmitFollowUpAction = {followUpAction, reportID};
    activeSpan.setAttribute(CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION, followUpAction);
    if (reportID !== undefined) {
        activeSpan.setAttribute(CONST.TELEMETRY.ATTRIBUTE_REPORT_ID, reportID);
    }
}

/**
 * Clear the pending follow-up action (e.g. when the span is ended or cancelled).
 */
function clearPendingSubmitFollowUpAction() {
    pendingSubmitFollowUpAction = null;
}

/**
 * Read the current pending follow-up action (for screens to check if they should end the span).
 * Not reactive; call from within a callback (e.g. useFocusEffect, onLayout).
 */
function getPendingSubmitFollowUpAction(): PendingSubmitFollowUpAction {
    return pendingSubmitFollowUpAction;
}

/**
 * End the submit-to-visible span and clear the pending action. Call from each screen when its main content is visible (e.g. onLayout).
 * Only ends the span if the passed followUpAction matches the current pending action (avoids races and wrong attribution).
 * When a tracking session is active, emits a structured dev log and clears tracking state.
 */
function endSubmitFollowUpActionSpan(followUpAction: SubmitFollowUpAction, reportID?: string, extraAttributes?: Record<string, SpanAttributeValue>) {
    if (!getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)) {
        return;
    }
    const pending = pendingSubmitFollowUpAction;
    if (pending?.followUpAction !== followUpAction) {
        return;
    }
    if (pending.reportID !== undefined && pending.reportID !== reportID) {
        return;
    }

    clearSafetyTimeout();

    // Uses performance.now() for the dev log duration because the Sentry span's internal
    // start time is not accessible via the public API. The Sentry span tracks its own
    // duration independently for production metrics; this timer is only for the dev log.
    if (trackingState) {
        const durationMs = Math.round(performance.now() - trackingState.startTime);
        const fp = trackingState.fastPath ?? 'unset';
        const pathLabel = fp === CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT || fp === 'unset' ? 'slow path' : 'fast path';
        const opts = trackingState.optimizations.size > 0 ? [...trackingState.optimizations].join(', ') : 'none';
        if (__DEV__) {
            if (fp === 'unset') {
                Log.warn('[SubmitExpense] endSubmitFollowUpActionSpan called before setFastPath - missing setFastPath() in the submit flow');
            }
            Log.info(`[SubmitExpense] ${trackingState.context.scenario} -> ${followUpAction} (${opts}) ${durationMs}ms [${pathLabel}]`);
        }
        trackingState = null;
    }

    const attributes: Record<string, SpanAttributeValue> = {
        [CONST.TELEMETRY.ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION]: followUpAction,
        ...extraAttributes,
    };
    if (reportID !== undefined) {
        attributes[CONST.TELEMETRY.ATTRIBUTE_REPORT_ID] = reportID;
    }
    endSpanWithAttributes(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE, attributes);
    clearPendingSubmitFollowUpAction();
}

function clearSafetyTimeout() {
    if (safetyTimeoutId === null) {
        return;
    }
    clearTimeout(safetyTimeoutId);
    safetyTimeoutId = null;
}

/**
 * Cancel the submit-to-visible span and clear the pending follow-up action.
 */
function cancelSubmitFollowUpActionSpan() {
    clearSafetyTimeout();
    cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
    clearPendingSubmitFollowUpAction();
    trackingState = null;
}

// ---------------------------------------------------------------------------
// Tracking session lifecycle
// ---------------------------------------------------------------------------

function startTracking(context: SubmitExpenseContext, options?: StartTrackingOptions) {
    if (!navListenerRegistered && navigationRef.addListener) {
        navListenerRegistered = true;
        navigationRef.addListener('state', cancelIfStaleForNavState);
    }

    cancelTracking();

    const skip = options?.skipSubmitExpenseSpan ?? false;
    const attributes: Record<string, SpanAttributeValue> = {
        [CONST.TELEMETRY.ATTRIBUTE_SCENARIO]: context.scenario,
        [CONST.TELEMETRY.ATTRIBUTE_HAS_RECEIPT]: context.hasReceipt,
        [CONST.TELEMETRY.ATTRIBUTE_IS_FROM_GLOBAL_CREATE]: context.isFromGlobalCreate,
        [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: context.iouType,
        [CONST.TELEMETRY.ATTRIBUTE_IOU_REQUEST_TYPE]: context.requestType,
    };

    if (!skip) {
        startSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE, {
            name: 'submit-expense',
            op: CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE,
        })?.setAttributes(attributes);
    }

    startSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE, {
        name: 'submit-to-destination-visible',
        op: CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE,
    })?.setAttributes(attributes);

    trackingState = {
        context,
        fastPath: null,
        optimizations: new Set(),
        startTime: performance.now(),
        skipSubmitExpenseSpan: skip,
    };

    safetyTimeoutId = setTimeout(() => {
        safetyTimeoutId = null;
        if (trackingState) {
            Log.warn('[SubmitExpense] Safety timeout: span still open after 60s, cancelling');
            cancelTracking();
        }
    }, SPAN_SAFETY_TIMEOUT_MS);
}

/**
 * Record which fast path handler was selected and optionally add optimizations in one call.
 * Write-once per tracking session - subsequent calls are ignored to prevent confusion when
 * isSameFlowUpdate refinements trigger additional setPendingSubmitFollowUpAction calls later
 * in the same flow.
 */
function setFastPath(fastPath: FastPathType, ...optimizations: Optimization[]) {
    if (!trackingState) {
        return;
    }
    if (trackingState.fastPath !== null) {
        if (__DEV__) {
            Log.warn(`[SubmitExpense] setFastPath ignored: already set to '${trackingState.fastPath}', attempted '${fastPath}'`);
        }
        return;
    }
    trackingState.fastPath = fastPath;
    for (const opt of optimizations) {
        trackingState.optimizations.add(opt);
    }
    getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_FAST_PATH_HANDLER, fastPath);
}

function addOptimization(...optimizations: Optimization[]) {
    if (!trackingState) {
        return;
    }
    for (const opt of optimizations) {
        trackingState.optimizations.add(opt);
    }
}

function cancelTracking() {
    if (!trackingState) {
        return;
    }
    const {skipSubmitExpenseSpan} = trackingState;
    cancelSubmitFollowUpActionSpan();
    if (!skipSubmitExpenseSpan) {
        cancelSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    }
}

/**
 * Returns true when a tracking session is active (startTracking was called and
 * neither endSubmitFollowUpActionSpan nor cancelTracking has cleared it yet).
 */
function isTracking(): boolean {
    return trackingState !== null;
}

/**
 * Check whether the pending span is still valid given the current navigation
 * state. Call this on every navigation state change to cancel spans that can
 * no longer complete (user navigated away from the expected destination).
 */
function cancelIfStaleForNavState() {
    if (!trackingState) {
        return;
    }

    const pending = pendingSubmitFollowUpAction;
    if (!pending || !getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE)) {
        return;
    }

    const rootState = navigationRef.getRootState();
    if (!rootState) {
        return;
    }

    const lastRoute = rootState.routes.at(-1);
    const hasModalOpen = lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR || lastRoute?.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR;

    // While a modal/RHP is open, the submit flow may still be in progress
    // (the confirmation screen itself is a modal). Don't cancel prematurely.
    if (hasModalOpen) {
        return;
    }

    const topmostFullScreenRoute = rootState.routes.findLast((route) => isFullScreenName(route.name));
    const activeTabName = getActiveTabName(topmostFullScreenRoute);
    const isOnSearchRoot = activeTabName === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR;
    const isOnReport = activeTabName === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;

    switch (pending.followUpAction) {
        case CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH:
            if (!isOnSearchRoot) {
                Log.info('[SubmitExpense] Stale span: expected search but user is elsewhere, cancelling');
                cancelTracking();
            }
            break;
        case CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT:
            if (!isOnReport) {
                Log.info('[SubmitExpense] Stale span: expected report but user is elsewhere, cancelling');
                cancelTracking();
            }
            break;
        case CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY:
            if (!isOnSearchRoot && !isOnReport) {
                Log.info('[SubmitExpense] Stale span: modal dismissed but user on unexpected screen, cancelling');
                cancelTracking();
            }
            break;
        default:
            break;
    }
}

export {endSubmitFollowUpActionSpan, setPendingSubmitFollowUpAction, getPendingSubmitFollowUpAction, cancelSubmitFollowUpActionSpan, startTracking, setFastPath, addOptimization, isTracking};
export type {SubmitFollowUpAction, PendingSubmitFollowUpAction, FastPathType, Optimization, SubmitExpenseContext, StartTrackingOptions};
