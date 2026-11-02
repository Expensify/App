import React, {useEffect, useRef, useState} from 'react';
import LocationPermissionModal from '@components/LocationPermissionModal';
import useOnyx from '@hooks/useOnyx';
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
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
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

function getFocusedReportsSplitReportID(rootState: ReturnType<typeof navigationRef.getRootState>): string | undefined {
    const topmostTabNavigatorRoute = rootState?.routes.findLast((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    const tabState = topmostTabNavigatorRoute?.state;
    const activeTabRoute = tabState?.routes.at(tabState.index ?? 0);
    if (activeTabRoute?.name !== NAVIGATORS.REPORTS_SPLIT_NAVIGATOR || !activeTabRoute.state) {
        return undefined;
    }

    const focusedRoute = activeTabRoute.state.routes.at(activeTabRoute.state.index ?? 0);
    const reportID = focusedRoute?.name === SCREENS.REPORT && focusedRoute.params && 'reportID' in focusedRoute.params ? focusedRoute.params.reportID : undefined;
    return typeof reportID === 'string' ? reportID : undefined;
}

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
    const [destinationReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${destinationReportID}`);
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

    // Unified from both prop (isFromGlobalCreate) and transaction flags because
    // the transaction flags are the source of truth — the prop is derived from
    // the same transaction at mount time. Either source being true is sufficient
    // for correct handler selection (e.g. SEARCH_DISMISS) and telemetry.
    const isFromGlobalCreateFromTransaction = !!(isFromGlobalCreateOnTransaction || isFromFloatingActionButtonOnTransaction);
    const isFromGlobalCreateForNavigation = !!(isFromGlobalCreate || isFromGlobalCreateFromTransaction);

    const startSubmitSpans = () => {
        const hasReceiptFiles = Object.values(receiptFiles).some((receipt) => !!receipt);
        const scenario = getSubmitExpenseScenario({
            iouType,
            isDistanceRequest,
            isMovingTransactionFromTrackExpense,
            isUnreported,
            isCategorizingTrackExpense,
            isSharingTrackExpense,
            isPerDiemRequest,
            isFromGlobalCreate: isFromGlobalCreateForNavigation,
            hasReceiptFiles,
        });

        startTracking({
            scenario,
            iouType,
            requestType: requestType ?? 'unknown',
            isFromGlobalCreate: isFromGlobalCreateForNavigation,
            hasReceipt: hasReceiptFiles,
        });
    };

    // Captures navigation state at decision time for getSubmitHandler. Some handlers
    // re-read live state (e.g. getIsNarrowLayout, focused Reports state) for execution
    // details - this is safe because snapshot + handler run in the same synchronous block.
    const buildNavigationSnapshot = (rootState: ReturnType<typeof navigationRef.getRootState>): SubmitNavigationSnapshot => {
        const isPreInserted = Navigation.getIsFullscreenPreInsertedUnderRHP();
        return {
            isPreInserted,
            isReportPreInserted: isPreInserted && Navigation.getPreInsertedFullscreenRouteName() === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
            isFromGlobalCreate: isFromGlobalCreateForNavigation,
            canDismissFromSearch,
            navigatesToDestinationReport: iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.TRACK,
            destinationReportID,
            isReportInRHP: isReportOpenInRHP(rootState),
            isReportTopmostSplit: isReportTopmostSplitNavigator(),
            isSearchTopmostFullScreen: isSearchTopmostFullScreenRoute(),
            isDestinationReportLoaded: !!destinationReportID && !!getReportOrDraftReport(destinationReportID, undefined, undefined, undefined, destinationReport)?.reportID,
        };
    };

    // Fast-path handlers defer createTransaction until after the dismiss animation completes
    // via dismissModal's afterTransition callback (backed by TransitionTracker). This prevents
    // heavy optimistic Onyx writes from blocking the JS thread during the RHP slide-out animation.
    const handleSearchPreInsert = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        Navigation.clearFullscreenPreInsertedFlag();
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        Navigation.dismissModal({
            afterTransition: () => {
                // shouldHandleNavigation defaults to true here (other fast paths pass false). The Search screen was
                // pre-inserted before the modal opened, so the nav stack is already correct and createTransaction's
                // post-create cleanup (navigateAfterExpenseCreate) finishes the flow.
                createTransaction(locationPermissionGranted);
                setIsConfirming(false);
            },
        });
    };

    const dismissAfterEnsuringDestinationReportIsPreInserted = (reportID: string | undefined, afterTransition: () => void) => {
        if (!reportID) {
            Navigation.dismissModal({afterTransition});
            return;
        }

        // Only trust the pre-inserted report if it is the focused child of the Reports tab.
        // A stale report route can still exist behind Inbox in the Reports stack.
        if (getFocusedReportsSplitReportID(navigationRef.getRootState()) === reportID) {
            Navigation.dismissModal({afterTransition});
            return;
        }

        Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(reportID), {afterTransition});
    };

    const handleReportPreInsert = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const wasPreInserted = Navigation.getIsFullscreenPreInsertedUnderRHP();
        Navigation.clearFullscreenPreInsertedFlag();
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID});

        const afterTransition = () => {
            createTransaction(locationPermissionGranted, false);
            setIsConfirming(false);
        };

        if (wasPreInserted) {
            Navigation.dismissModal({afterTransition});
            return;
        }

        dismissAfterEnsuringDestinationReportIsPreInserted(destinationReportID, afterTransition);
    };

    const handleDismissModalFastPath = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_MODAL, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const shouldPreserveSearchWithPlaceholder = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.TRACK) && isSearchTopmostFullScreenRoute();
        reserveDeferredWriteChannel(shouldPreserveSearchWithPlaceholder ? CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH : CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL, {destinationReportID});

        const runAfterDismiss = () => {
            createTransaction(locationPermissionGranted, false);
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
    const handleSearchDismiss = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const searchType = iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isSameType = getCurrentSearchQueryJSON()?.type === searchType;
        const isNarrow = getIsNarrowLayout();
        // When the query type matches AND Search is already visible, a simple dismiss suffices.
        // When Search is not visible (e.g. submitting from Home/Settings), we must navigate there.
        const isSearchVisible = isSearchTopmostFullScreenRoute();
        const shouldNavigateToSearch = !isSameType || !isSearchVisible;
        setPendingSubmitFollowUpAction(shouldNavigateToSearch ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);

        const runAfterDismiss = () => {
            createTransaction(locationPermissionGranted, false);
            setIsConfirming(false);
        };

        const runAfterSearchDismissRecovery = (afterRecovery?: () => void) => {
            const finish = () => {
                runAfterDismiss();
                afterRecovery?.();
            };

            if (navigationRef.getRootState()?.routes?.at(-1)?.name !== NAVIGATORS.RIGHT_MODAL_NAVIGATOR) {
                finish();
                return;
            }

            Log.info('[SubmitExpenseOrchestrator] Search dismiss recovery: RHP still on top after first dismiss, dismissing again');
            Navigation.dismissModal({
                afterTransition: finish,
            });
        };

        if (shouldNavigateToSearch && !isNarrow) {
            dismissWideToNewSearchType(searchType, runAfterDismiss);
            return;
        }

        Navigation.dismissModal({
            afterTransition: () => {
                runAfterSearchDismissRecovery(() => {
                    if (!shouldNavigateToSearch) {
                        return;
                    }

                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: searchType})}), {forceReplace: true});
                });
            },
        });
    };

    const handleDismissToReport = (locationPermissionGranted = false) => {
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
                createTransaction(locationPermissionGranted);
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
                createTransaction(locationPermissionGranted, false);
                setIsConfirming(false);
            },
        });
    };

    // A global-create submit off the inbox lands on Search — reserve the channel so the optimistic write defers behind the skeleton.
    const reserveSearchChannelIfGlobalCreate = () => {
        if (!isFromGlobalCreateForNavigation || isReportTopmostSplitNavigator()) {
            return;
        }
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
    };

    const handleDefaultSubmit = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
        reserveSearchChannelIfGlobalCreate();
        requestAnimationFrame(() => {
            createTransaction(locationPermissionGranted);
            requestAnimationFrame(() => {
                setIsConfirming(false);
            });
        });
    };

    // The createTransaction call runs inside runAfterDismiss (after the transition completes).
    // When the destination report is empty we reserve a DISMISS_MODAL deferred-write channel
    // so that MoneyRequestReportActionsList can show a loading skeleton instead of the
    // "no expenses" empty state while the dismiss animation plays.
    const handleReportInRHPDismiss = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_IN_RHP_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const rootState = navigationRef.getRootState();

        const report = destinationReportID ? getReportOrDraftReport(destinationReportID, undefined, undefined, undefined, destinationReport) : undefined;
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
            createTransaction(locationPermissionGranted, false);
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
        handleDefaultSubmit(locationPermissionGranted);
    };

    const dispatchSubmitHandler = (locationPermissionGranted = false) => {
        startSubmitSpans();
        const rootState = navigationRef.getRootState();
        const snapshot = buildNavigationSnapshot(rootState);
        const handler = getSubmitHandler(snapshot);

        const handlers: Record<SubmitHandler, () => void> = {
            [SUBMIT_HANDLER.SEARCH_PRE_INSERT]: () => handleSearchPreInsert(locationPermissionGranted),
            [SUBMIT_HANDLER.REPORT_PRE_INSERT]: () => handleReportPreInsert(locationPermissionGranted),
            [SUBMIT_HANDLER.DISMISS_MODAL]: () => handleDismissModalFastPath(locationPermissionGranted),
            [SUBMIT_HANDLER.DISMISS_TO_REPORT]: () => handleDismissToReport(locationPermissionGranted),
            [SUBMIT_HANDLER.REPORT_IN_RHP_DISMISS]: () => handleReportInRHPDismiss(locationPermissionGranted),
            [SUBMIT_HANDLER.SEARCH_DISMISS]: () => handleSearchDismiss(locationPermissionGranted),
            [SUBMIT_HANDLER.DEFAULT]: () => handleDefaultSubmit(locationPermissionGranted),
        };

        handlers[handler]();
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

        dispatchSubmitHandler();
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
                        dispatchSubmitHandler(true);
                    }}
                    onDeny={(wasUserInitiated) => {
                        if (wasUserInitiated) {
                            updateLastLocationPermissionPrompt();
                        }
                        dispatchSubmitHandler(false);
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
