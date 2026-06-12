import React, {useEffect, useRef, useState} from 'react';
import LocationPermissionModal from '@components/LocationPermissionModal';
import DateUtils from '@libs/DateUtils';
import {cancelDeferredWrite, flushDeferredWrite, reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportOpenInSuperWideRHP from '@libs/Navigation/helpers/isReportOpenInSuperWideRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import getSubmitExpenseScenario from '@libs/telemetry/getSubmitExpenseScenario';
import {setFastPath, setPendingSubmitFollowUpAction, startTracking} from '@libs/telemetry/submitFollowUpAction';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU/MoneyRequest';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Receipt} from '@src/types/onyx/Transaction';
import {getSubmitHandler, SUBMIT_HANDLER} from './getSubmitHandler';
import type {SubmitHandler, SubmitNavigationSnapshot} from './getSubmitHandler';
import {dismissOnly, dismissRHPToReport, dismissSuperWideRHP, dismissWideToNewSearchType, executeDismissModalStrategy} from './submitDismissStrategies';

type SubmitExpenseOrchestratorRenderProps = {
    onConfirm: () => void;
    isConfirming: boolean;
};

type SubmitExpenseOrchestratorProps = {
    /** Calls the appropriate IOU action (requestMoney, trackExpense, etc.) to create the transaction. */
    createTransaction: (locationPermissionGranted?: boolean, shouldHandleNavigation?: boolean) => void;

    /** Report that the expense will land on (undefined when destination is unknown, e.g. global create to Search). */
    destinationReportID: string | undefined;

    /** Whether the flow was started from the global FAB (affects which fast paths are eligible). */
    isFromGlobalCreate: boolean;

    /** Current IOU type (request, split, track, send, invoice, etc.). */
    iouType: IOUType;

    /** Request sub-type (manual, scan, distance). Used for telemetry scenario derivation. */
    requestType: string | undefined;

    /** Whether the user can be navigated to Search after submit (derived from iouType eligibility). */
    canDismissFromSearch: boolean;

    /** Whether the distance request requires GPS permission before submitting. */
    gpsRequired: boolean;

    /** ISO timestamp of the last GPS permission prompt (for throttling re-prompts). */
    lastLocationPermissionPrompt: string | undefined;

    /** True when the transaction is a distance (mileage) request. */
    isDistanceRequest: boolean;

    /** True when moving a self-tracked expense to someone else. */
    isMovingTransactionFromTrackExpense: boolean;

    /** True when the expense is not yet associated with a report. */
    isUnreported: boolean;

    /** True when categorizing a previously tracked expense. */
    isCategorizingTrackExpense: boolean;

    /** True when sharing a tracked expense with someone. */
    isSharingTrackExpense: boolean;

    /** True when the expense is a per-diem type. */
    isPerDiemRequest: boolean;

    /** Receipt files attached to the transaction (keyed by receipt hash). */
    receiptFiles: Record<string, Receipt | undefined>;

    /** Persisted flag on the transaction: flow originated from the global create button. */
    isFromGlobalCreateOnTransaction: boolean;

    /** Persisted flag on the transaction: flow originated from the floating action button. */
    isFromFloatingActionButtonOnTransaction: boolean;

    /** Render prop receiving onConfirm and isConfirming. */
    children: (props: SubmitExpenseOrchestratorRenderProps) => React.ReactNode;
};

/**
 * Encapsulates the submit-expense navigation orchestration: telemetry lifecycle,
 * dismiss animation coordination, deferred writes, and the GPS permission flow.
 * Exposes `onConfirm` and `isConfirming` via a render prop so the parent only
 * needs to wire them to `MoneyRequestConfirmationList`.
 *
 * A render-prop component (rather than a hook) is used because this wrapper
 * needs to render `LocationPermissionModal` conditionally. A hook cannot own
 * JSX, so we'd need to return the modal element and have the caller place it
 * - which spreads the concern across two files again.
 *
 * The decision tree (which handler to invoke) is extracted into the pure
 * `getSubmitHandler()` function (see getSubmitHandler.ts) for isolated
 * testability. This component maps the returned handler name to the
 * corresponding side-effectful implementation.
 */
function SubmitExpenseOrchestrator({
    createTransaction,
    destinationReportID,
    isFromGlobalCreate,
    iouType,
    requestType,
    canDismissFromSearch,
    gpsRequired,
    lastLocationPermissionPrompt,
    isDistanceRequest,
    isMovingTransactionFromTrackExpense,
    isUnreported,
    isCategorizingTrackExpense,
    isSharingTrackExpense,
    isPerDiemRequest,
    receiptFiles,
    isFromGlobalCreateOnTransaction,
    isFromFloatingActionButtonOnTransaction,
    children,
}: SubmitExpenseOrchestratorProps) {
    const [isConfirming, setIsConfirming] = useState(false);
    const [startLocationPermissionFlow, setStartLocationPermissionFlow] = useState(false);
    const confirmingSafetyTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        if (!isConfirming) {
            clearTimeout(confirmingSafetyTimeout.current);
            return;
        }
        // *5: longer than ReportScreen's *3 deferral timeout because this guards
        // against stuck confirming state across all handler paths including
        // TransitionTracker + afterTransition chains that may take longer.
        confirmingSafetyTimeout.current = setTimeout(() => setIsConfirming(false), CONST.MAX_TRANSITION_DURATION_MS * 5);
        return () => clearTimeout(confirmingSafetyTimeout.current);
    }, [isConfirming]);

    const startSubmitSpans = () => {
        const hasReceiptFiles = Object.values(receiptFiles).some((receipt) => !!receipt);
        // Re-derive from transaction inside the callback so telemetry captures the value
        // at submission time, not at render time (transaction is mutable Onyx state).
        const isFromGlobalCreateForTelemetry = !!(isFromGlobalCreateOnTransaction || isFromFloatingActionButtonOnTransaction);
        const scenario = getSubmitExpenseScenario({
            iouType,
            isDistanceRequest,
            isMovingTransactionFromTrackExpense,
            isUnreported,
            isCategorizingTrackExpense,
            isSharingTrackExpense,
            isPerDiemRequest,
            isFromGlobalCreate: isFromGlobalCreateForTelemetry,
            hasReceiptFiles,
        });

        startTracking({
            scenario,
            iouType,
            requestType: requestType ?? 'unknown',
            isFromGlobalCreate: isFromGlobalCreateForTelemetry,
            hasReceipt: hasReceiptFiles,
        });
    };

    // Captures navigation state at decision time for getSubmitHandler. Some handlers
    // re-read live state (e.g. getIsNarrowLayout, getTopmostReportParams) for execution
    // details - this is safe because snapshot + handler run in the same synchronous block.
    const buildNavigationSnapshot = (rootState: ReturnType<typeof navigationRef.getRootState>): SubmitNavigationSnapshot => {
        const isPreInserted = Navigation.getIsFullscreenPreInsertedUnderRHP();
        return {
            isPreInserted,
            isReportPreInserted: isPreInserted && Navigation.getPreInsertedFullscreenRouteName() === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            isFromGlobalCreate,
            canDismissFromSearch,
            navigatesToDestinationReport: iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.TRACK,
            destinationReportID,
            isReportInRHP: isReportOpenInRHP(rootState),
            isReportTopmostSplit: isReportTopmostSplitNavigator(),
            isSearchTopmostFullScreen: isSearchTopmostFullScreenRoute(),
            isDestinationReportLoaded: !!destinationReportID && !!getReportOrDraftReport(destinationReportID)?.reportID,
        };
    };

    // Fast-path handlers defer createTransaction until after the dismiss animation completes
    // via dismissModal's afterTransition callback (backed by TransitionTracker). This prevents
    // heavy optimistic Onyx writes from blocking the JS thread during the RHP slide-out animation.
    const handleSearchPreInsert = () => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        Navigation.clearFullscreenPreInsertedFlag();
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        Navigation.dismissModal({
            afterTransition: () => {
                // shouldHandleNavigation defaults to true here (other fast paths pass false). The Search screen was
                // pre-inserted before the modal opened, so the nav stack is already correct and createTransaction's
                // post-create cleanup (navigateAfterExpenseCreate) finishes the flow.
                createTransaction();
                setIsConfirming(false);
            },
        });
    };

    const handleReportPreInsert = () => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        Navigation.clearFullscreenPreInsertedFlag();
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID});
        Navigation.dismissModal({
            afterTransition: () => {
                createTransaction(false, false);
                setIsConfirming(false);
            },
        });
    };

    const handleDismissModalFastPath = () => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_MODAL, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const shouldPreserveSearchWithPlaceholder = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.TRACK) && isSearchTopmostFullScreenRoute();
        reserveDeferredWriteChannel(shouldPreserveSearchWithPlaceholder ? CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH : CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID});

        const runAfterDismiss = () => {
            createTransaction(false, false);
            setIsConfirming(false);
        };

        if (isSearchTopmostFullScreenRoute()) {
            dismissOnly(runAfterDismiss);
            return;
        }

        executeDismissModalStrategy(destinationReportID, runAfterDismiss);
    };

    // Primary wide-layout handler and narrow-layout fallback for global-create
    // submissions when Search is already the topmost fullscreen route.
    //
    // Wide: always the handler
    // Narrow: only runs if the user submitted before the pre-insert timer (300ms)
    // elapsed - SEARCH_PRE_INSERT is the primary narrow handler.
    const handleSearchDismiss = () => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const searchType = iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isSameType = getCurrentSearchQueryJSON()?.type === searchType;
        setPendingSubmitFollowUpAction(isSameType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);

        const runAfterDismiss = () => {
            createTransaction(false, false);
            setIsConfirming(false);
        };

        if (!isSameType && !getIsNarrowLayout()) {
            dismissWideToNewSearchType(searchType, runAfterDismiss);
            return;
        }

        Navigation.dismissModal({
            afterTransition: () => {
                runAfterDismiss();
                // Narrow fallback: pre-insert timer didn't fire, navigate after dismiss.
                if (!isSameType) {
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: searchType})}), {forceReplace: true});
                }
            },
        });
    };

    const handleDismissToReport = () => {
        if (!destinationReportID) {
            // Tracking already started in onSubmit; just override the fast path label.
            Log.warn('[SubmitExpenseOrchestrator] handleDismissToReport reached without destinationReportID - falling back to default submit');
            setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
            // Matches the handleDefaultSubmit pattern: first rAF yields the JS
            // thread so the current render cycle completes, second rAF delays
            // unblocking the confirm button until the transaction creation has
            // committed to Onyx and a fresh render is queued. The double-rAF
            // is intentionally the same approach used in handleDefaultSubmit so
            // this fallback behaves identically to the standard submit path.
            requestAnimationFrame(() => {
                createTransaction();
                requestAnimationFrame(() => {
                    setIsConfirming(false);
                });
            });
            return;
        }

        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_TO_REPORT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);

        Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(destinationReportID), {
            afterTransition: () => {
                createTransaction(false, false);
                setIsConfirming(false);
            },
        });
    };

    // A global-create submit off the inbox lands on Search — reserve the channel so the optimistic write defers behind the skeleton.
    const reserveSearchChannelIfGlobalCreate = () => {
        if (!isFromGlobalCreate || isReportTopmostSplitNavigator()) {
            return;
        }
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
    };

    const handleDefaultSubmit = () => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
        reserveSearchChannelIfGlobalCreate();
        requestAnimationFrame(() => {
            createTransaction();
            requestAnimationFrame(() => {
                setIsConfirming(false);
            });
        });
    };

    // The createTransaction call runs inside runAfterDismiss (after the transition completes).
    // When the destination report is empty we reserve a DISMISS_MODAL deferred-write channel
    // so that MoneyRequestReportActionsList can show a loading skeleton instead of the
    // "no expenses" empty state while the dismiss animation plays.
    const handleReportInRHPDismiss = () => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_IN_RHP_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const rootState = navigationRef.getRootState();

        const report = destinationReportID ? getReportOrDraftReport(destinationReportID) : undefined;
        const isDestinationEmpty = !!report && isMoneyRequestReport(report) && !report.transactionCount;
        if (isDestinationEmpty) {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID});
        }

        const runAfterDismiss = () => {
            // Flush signals readiness on the reserved channel. Since no real write was
            // registered, the channel transitions to flushRequested. When createTransaction
            // below calls deferOrExecuteWrite, it sees the flushed channel and executes
            // the write immediately instead of deferring.
            if (isDestinationEmpty) {
                flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            }
            createTransaction(false, false);
            setIsConfirming(false);
        };

        if (isReportOpenInSuperWideRHP(rootState)) {
            dismissSuperWideRHP(destinationReportID, runAfterDismiss);
            return;
        }

        if (destinationReportID) {
            dismissRHPToReport(destinationReportID, runAfterDismiss);
            return;
        }

        Log.warn('[SubmitExpenseOrchestrator] handleReportInRHPDismiss reached without destinationReportID - falling back to default submit');
        if (isDestinationEmpty) {
            cancelDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
        }
        handleDefaultSubmit();
    };

    // Not wrapped in useCallback: MoneyRequestConfirmationList is React.memo-wrapped, but this
    // matches the pre-existing pattern in IOURequestStepConfirmation. The parent re-renders
    // frequently from Onyx subscriptions anyway, and wrapping this properly would require
    // memoizing every handler + all their captured props for no measurable gain.
    const onConfirm = () => {
        setIsConfirming(true);

        if (gpsRequired) {
            const shouldStartPermissionFlow =
                !lastLocationPermissionPrompt ||
                (DateUtils.isValidDateString(lastLocationPermissionPrompt) &&
                    DateUtils.getDifferenceInDaysFromNow(new Date(lastLocationPermissionPrompt)) > CONST.IOU.LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS);

            if (shouldStartPermissionFlow) {
                setStartLocationPermissionFlow(true);
                return;
            }
        }

        startSubmitSpans();

        const rootState = navigationRef.getRootState();
        const handler = getSubmitHandler(buildNavigationSnapshot(rootState));

        const handlers: Record<SubmitHandler, () => void> = {
            [SUBMIT_HANDLER.SEARCH_PRE_INSERT]: handleSearchPreInsert,
            [SUBMIT_HANDLER.REPORT_PRE_INSERT]: handleReportPreInsert,
            [SUBMIT_HANDLER.DISMISS_MODAL]: handleDismissModalFastPath,
            [SUBMIT_HANDLER.DISMISS_TO_REPORT]: handleDismissToReport,
            [SUBMIT_HANDLER.REPORT_IN_RHP_DISMISS]: handleReportInRHPDismiss,
            [SUBMIT_HANDLER.SEARCH_DISMISS]: handleSearchDismiss,
            [SUBMIT_HANDLER.DEFAULT]: handleDefaultSubmit,
        };

        handlers[handler]();
    };

    return (
        <>
            {!!gpsRequired && (
                <LocationPermissionModal
                    startPermissionFlow={startLocationPermissionFlow}
                    resetPermissionFlow={() => {
                        setStartLocationPermissionFlow(false);
                    }}
                    onGrant={() => {
                        startSubmitSpans();
                        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
                        reserveSearchChannelIfGlobalCreate();
                        createTransaction(true);
                    }}
                    onDeny={(wasUserInitiated) => {
                        startSubmitSpans();
                        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
                        if (wasUserInitiated) {
                            updateLastLocationPermissionPrompt();
                        }
                        reserveSearchChannelIfGlobalCreate();
                        createTransaction(false);
                    }}
                    onInitialGetLocationCompleted={() => {
                        setIsConfirming(false);
                    }}
                />
            )}
            {children({onConfirm, isConfirming})}
        </>
    );
}

export default SubmitExpenseOrchestrator;
