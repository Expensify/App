import LocationPermissionModal from '@components/LocationPermissionModal';

import useOnyx from '@hooks/useOnyx';
import type {AfterTransition} from '@hooks/usePreMountDestination';

import {armTransitionBarrier} from '@libs/API';
import type {WriteReadyBarrier} from '@libs/API';
import DateUtils from '@libs/DateUtils';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportOpenInSuperWideRHP from '@libs/Navigation/helpers/isReportOpenInSuperWideRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import markPendingWriteForSearchPage from '@libs/Navigation/helpers/markPendingWriteForSearchPage';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {markPendingSearchWrite} from '@libs/pendingSearchWrite';
import {markPendingSubmitWriteForReport} from '@libs/pendingSubmitWrite';
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
import type {Receipt} from '@src/types/onyx/Transaction';

import React, {useEffect, useRef, useState} from 'react';

import type {SubmitHandler, SubmitNavigationSnapshot} from './getSubmitHandler';

import getSubmitExpenseSearchType from './getSubmitExpenseSearchType';
import {getSubmitHandler, SUBMIT_HANDLER} from './getSubmitHandler';
import {dismissOnly, dismissRHPToReport, dismissSuperWideRHP, dismissWideToNewSearchType, executeDismissModalStrategy} from './submitDismissStrategies';

type SubmitExpenseOrchestratorRenderProps = {
    onConfirm: () => void;
    isConfirming: boolean;
};

type SubmitExpenseOrchestratorProps = {
    /**
     * Calls the appropriate IOU action (requestMoney, trackExpense, etc.) to create the transaction.
     * `writeBarrier`, when given, is what the resulting API write waits on before applying its
     * optimistic data - so the re-render wave lands after the dismiss animation instead of during it.
     */
    createTransaction: (locationPermissionGranted?: boolean, shouldHandleNavigation?: boolean, writeBarrier?: WriteReadyBarrier) => void;

    /** Report that the expense will land on (undefined when destination is unknown, e.g. global create to Search). */
    destinationReportID: string | undefined;

    /** Whether the flow was started from the global FAB (affects which fast paths are eligible). */
    isFromGlobalCreate: boolean;

    /** Current IOU type (request, split, track, send, invoice, etc.). */
    iouType: IOUType;

    /**
     * Whether the sole recipient resolves to the current user's self-DM while the route iouType is still CREATE
     * (new manual expense flow). Such a submit is routed through trackExpense, so it must navigate to the self-DM
     * report like a TRACK expense instead of taking the global-create Search path.
     */
    isSelfDMDestination: boolean;

    /**
     * Whether the user onboarded as "Something else" (LOOKING_AROUND). Such users have no workspace, so a global-create
     * expense is routed to Spend > Expenses (Search) instead of dismissing into their self-DM report.
     */
    isLookingAroundUser: boolean;

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

    /** Reveals the pre-mounted destination behind the confirmation RHP and dismisses the modal. */
    revealPreMountDestination: (afterTransition?: AfterTransition) => void;
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
    isSelfDMDestination,
    isLookingAroundUser,
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
    revealPreMountDestination,
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
            navigatesToDestinationReport: iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.TRACK || isSelfDMDestination,
            destinationReportID,
            isReportInRHP: isReportOpenInRHP(rootState),
            isReportTopmostSplit: isReportTopmostSplitNavigator(),
            isSearchTopmostFullScreen: isSearchTopmostFullScreenRoute(),
            isDestinationReportLoaded: !!destinationReportID && !!getReportOrDraftReport(destinationReportID, undefined, undefined, undefined, destinationReport)?.reportID,
            isLookingAroundUser,
            isSelfDMDestination,
        };
    };

    // Fast-path handlers defer createTransaction until after the dismiss animation completes
    // via dismissModal's afterTransition callback (backed by TransitionTracker). This prevents
    // heavy optimistic Onyx writes from blocking the JS thread during the RHP slide-out animation.
    const handleSearchPreInsert = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        markPendingSearchWrite();
        revealPreMountDestination(() => {
            // shouldHandleNavigation defaults to true here (other fast paths pass false). The Search screen was
            // pre-inserted before the modal opened, so the nav stack is already correct and createTransaction's
            // post-create cleanup (navigateAfterExpenseCreate) finishes the flow.
            createTransaction(locationPermissionGranted);
            setIsConfirming(false);
        });
    };

    const handleReportPreInsert = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        // Armed before the reveal, so the barrier attaches to the transition that reveal starts.
        const writeBarrier = armTransitionBarrier().barrier;
        const clearPendingWrite = markPendingSubmitWriteForReport(destinationReportID);

        const afterTransition = () => {
            createTransaction(locationPermissionGranted, false, writeBarrier);
            clearPendingWrite();
            setIsConfirming(false);
        };

        // No duplicate-route guard is needed here: getSubmitExpensePreMountDestinationRoute only yields a report route (and thus
        // getSubmitHandler only selects REPORT_PRE_INSERT) when the report is NOT already the topmost fullscreen, so reveal()
        // dismisses over this hook's own pre-inserted route rather than pushing a second copy.
        revealPreMountDestination(afterTransition);
    };

    const handleDismissModalFastPath = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_MODAL, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const shouldPreserveSearchWithPlaceholder = (iouType === CONST.IOU.TYPE.SPLIT || iouType === CONST.IOU.TYPE.TRACK) && isSearchTopmostFullScreenRoute();

        let writeBarrier: WriteReadyBarrier | undefined;
        let clearPendingWrite = () => {};

        if (shouldPreserveSearchWithPlaceholder) {
            // Search-destined submissions release on Search's own content layout, not on this dismiss
            // transition, so they take Search's barrier instead of an armed transition one. The signal
            // has to go up here, before the write exists, because Search's placeholder reads it on mount.
            markPendingSearchWrite();
        } else {
            // Armed here, not inside the dismiss callbacks below: the barrier has to attach while this
            // dismiss transition is starting, otherwise it would wait out an unrelated later one.
            writeBarrier = armTransitionBarrier().barrier;
            clearPendingWrite = markPendingSubmitWriteForReport(destinationReportID);
        }

        const runAfterDismiss = () => {
            createTransaction(locationPermissionGranted, false, writeBarrier);
            // The barrier has already released by now, so the write goes out on the next microtask -
            // the same point the write session used to drop this signal.
            //
            // This holds for the strategies that run us from TransitionTracker rather than from a
            // dismiss callback (dismissNarrowWithReport) only because TransitionTracker flushes its
            // pending callbacks in registration order, and the barrier above was armed before the
            // strategy registered. Arming later than the dismiss call would clear this signal before
            // the write is even issued, which shows up as an empty-state flash on the destination.
            clearPendingWrite();
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
        const searchType = getSubmitExpenseSearchType(iouType);
        const isSameType = getCurrentSearchQueryJSON()?.type === searchType;
        const isNarrow = getIsNarrowLayout();
        // When the query type matches AND Search is already visible, a simple dismiss suffices.
        // When Search is not visible (e.g. submitting from Home/Settings), we must navigate there.
        const isSearchVisible = isSearchTopmostFullScreenRoute();
        const shouldNavigateToSearch = !isSameType || !isSearchVisible;
        // forceReplace resolves to a no-op for SEARCH.ROOT (it stays on the submitting tab), so skip it for the
        // LOOKING_AROUND self-DM flow to make the navigation to Search actually happen. Other callers keep forceReplace.
        const shouldSkipForceReplace = isFromGlobalCreateForNavigation && isLookingAroundUser && isSelfDMDestination;
        setPendingSubmitFollowUpAction(shouldNavigateToSearch ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
        markPendingSearchWrite();

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

                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: buildCannedSearchQuery({type: searchType})}), {forceReplace: !shouldSkipForceReplace});
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

    const handleDefaultSubmit = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
        markPendingWriteForSearchPage(isFromGlobalCreateForNavigation);
        requestAnimationFrame(() => {
            createTransaction(locationPermissionGranted);
            requestAnimationFrame(() => {
                setIsConfirming(false);
            });
        });
    };

    // The createTransaction call runs inside runAfterDismiss (after the transition completes).
    // When the destination report is empty we raise the pending-write signal so that
    // MoneyRequestReportActionsList shows a loading skeleton instead of the "no expenses"
    // empty state while the dismiss animation plays.
    //
    // Deliberately no write barrier here: this handler's write already executes immediately
    // (it used to reserve a channel purely for the skeleton, then flush it before createTransaction),
    // so gating it on a transition would newly delay a write that does not wait today.
    const handleReportInRHPDismiss = (locationPermissionGranted = false) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_IN_RHP_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const rootState = navigationRef.getRootState();

        const report = destinationReportID ? getReportOrDraftReport(destinationReportID, undefined, undefined, undefined, destinationReport) : undefined;
        const isDestinationEmpty = !!report && isMoneyRequestReport(report) && !report.transactionCount;
        const clearPendingWrite = isDestinationEmpty ? markPendingSubmitWriteForReport(destinationReportID) : () => {};

        const runAfterDismiss = () => {
            createTransaction(locationPermissionGranted, false);
            // Cleared after the write, matching where the flushed session used to drop it.
            clearPendingWrite();
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
        // Nothing dismisses here, so runAfterDismiss never runs - drop the signal explicitly rather
        // than leaving it to the safety timeout.
        clearPendingWrite();
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
