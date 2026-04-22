import React, {useEffect, useRef, useState} from 'react';
import LocationPermissionModal from '@components/LocationPermissionModal';
import DateUtils from '@libs/DateUtils';
import {flushDeferredWrite, reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import Log from '@libs/Log';
import getTopmostReportParams from '@libs/Navigation/helpers/getTopmostReportParams';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportOpenInSuperWideRHP from '@libs/Navigation/helpers/isReportOpenInSuperWideRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {getReportOrDraftReport, isMoneyRequestReport} from '@libs/ReportUtils';
import {buildCannedSearchQuery, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import getSubmitExpenseScenario from '@libs/telemetry/getSubmitExpenseScenario';
import {endSubmitFollowUpActionSpan, setFastPath, setPendingSubmitFollowUpAction, startTracking} from '@libs/telemetry/submitFollowUpAction';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type {Receipt} from '@src/types/onyx/Transaction';
import {getSubmitHandler, SUBMIT_HANDLER} from './getSubmitHandler';
import type {SubmitHandler, SubmitNavigationSnapshot} from './getSubmitHandler';

type SubmitExpenseOrchestratorRenderProps = {
    onConfirm: (participants: Participant[]) => void;
    isConfirming: boolean;
};

type SubmitExpenseOrchestratorProps = {
    /** Calls the appropriate IOU action (requestMoney, trackExpense, etc.) to create the transaction. */
    createTransaction: (participants: Participant[], locationPermissionGranted?: boolean, shouldHandleNavigation?: boolean) => void;

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
    const [selectedParticipantList, setSelectedParticipantList] = useState<Participant[]>([]);
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
            isSplitRequest: iouType === CONST.IOU.TYPE.SPLIT,
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
    const handleSearchPreInsert = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        Navigation.clearFullscreenPreInsertedFlag();
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        Navigation.dismissModal({
            afterTransition: () => {
                // shouldHandleNavigation defaults to true (unlike other fast paths that pass false).
                // Search pre-insert relies on createTransaction's internal navigation to handle the
                // post-creation flow (navigateAfterExpenseCreate), because the Search screen was
                // pre-inserted before the modal opened - the navigation stack is already correct.
                createTransaction(listOfParticipants);
                setIsConfirming(false);
            },
        });
    };

    const handleReportPreInsert = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        Navigation.clearFullscreenPreInsertedFlag();
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
        Navigation.dismissModal({
            afterTransition: () => {
                createTransaction(listOfParticipants, false, false);
                setIsConfirming(false);
            },
        });
    };

    const dismissOnly = (runAfterDismiss: () => void) => {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
        Navigation.dismissModal({
            afterTransition: () => {
                endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
                flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
                runAfterDismiss();
            },
        });
    };

    // Flush ordering: The DISMISS_MODAL deferred-write channel is flushed by
    // ReportScreen.useFocusEffect (on focus gain) or InteractionManager (wide layout
    // fallback). createTransaction (via runAfterDismiss) calls deferOrExecuteWrite
    // which either registers the write on the channel or executes immediately:
    //   - Focus fires first -> flushRequested is set -> deferOrExecuteWrite executes immediately
    //   - TransitionTracker fires first -> write is registered -> focus flush executes it later
    // Both orderings are correct. The 5s safety timeout in deferredLayoutWrite covers
    // edge cases where neither trigger fires (e.g. ReportScreen never mounts).
    const dismissNarrowWithReport = (reportID: string, runAfterDismiss: () => void) => {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
        Navigation.dismissModalWithReport({reportID}, undefined, {
            onBeforeNavigate: (willOpenReport) => {
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
    };

    const dismissWideToSameReport = (reportID: string, runAfterDismiss: () => void) => {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
        Navigation.dismissModal({
            afterTransition: () => {
                endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
                flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
                runAfterDismiss();
            },
        });
    };

    const dismissWideToNewReport = (reportID: string, runAfterDismiss: () => void) => {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID);
        Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(reportID), {
            afterTransition: () => {
                flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
                runAfterDismiss();
            },
        });
    };

    const handleDismissModalFastPath = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_MODAL, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

        const runAfterDismiss = () => {
            createTransaction(listOfParticipants, false, false);
            setIsConfirming(false);
        };

        if (isSearchTopmostFullScreenRoute() || !destinationReportID) {
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
    };

    // Wide layout: swap the visible Search tab to the correct type while the
    // modal slides away, so the user never sees the wrong tab underneath.
    const dismissWideToNewSearchType = (searchType: SearchDataTypes, runAfterDismiss: () => void) => {
        const queryString = buildCannedSearchQuery({type: searchType});
        Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {
            afterTransition: runAfterDismiss,
        });
    };

    // Primary wide-layout handler and narrow-layout fallback for global-create
    // submissions when Search is already the topmost fullscreen route.
    //
    // Wide: always the handler
    // Narrow: only runs if the user submitted before the pre-insert timer (300ms)
    // elapsed - SEARCH_PRE_INSERT is the primary narrow handler.
    const handleSearchDismiss = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const searchType = iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isSameType = getCurrentSearchQueryJSON()?.type === searchType;
        setPendingSubmitFollowUpAction(isSameType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);

        const runAfterDismiss = () => {
            createTransaction(listOfParticipants, false, false);
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
                    const queryString = buildCannedSearchQuery({type: searchType});
                    Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
                }
            },
        });
    };

    const dismissSuperWideRHP = (runAfterDismiss: () => void) => {
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, destinationReportID);
        Navigation.dismissToPreviousRHP({
            afterTransition: runAfterDismiss,
        });
    };

    const dismissRHPToReport = (reportID: string, runAfterDismiss: () => void) => {
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
    };

    const handleDefaultSubmit = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
        requestAnimationFrame(() => {
            createTransaction(listOfParticipants);
            requestAnimationFrame(() => {
                setIsConfirming(false);
            });
        });
    };

    // Unlike handleDismissModalFastPath, this handler does NOT call reserveDeferredWriteChannel.
    // The createTransaction call runs inside runAfterDismiss (after the transition completes),
    // so there is no animation to protect - the write can execute immediately via deferOrExecuteWrite.
    const handleReportInRHPDismiss = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_IN_RHP_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const rootState = navigationRef.getRootState();

        const runAfterDismiss = () => {
            createTransaction(listOfParticipants, false, false);
            setIsConfirming(false);
        };

        if (isReportOpenInSuperWideRHP(rootState)) {
            dismissSuperWideRHP(runAfterDismiss);
            return;
        }

        if (destinationReportID) {
            dismissRHPToReport(destinationReportID, runAfterDismiss);
            return;
        }

        Log.warn('[SubmitExpenseOrchestrator] handleReportInRHPDismiss reached without destinationReportID - falling back to default submit');
        handleDefaultSubmit(listOfParticipants);
    };

    // Not wrapped in useCallback: MoneyRequestConfirmationList is React.memo-wrapped, but this
    // matches the pre-existing pattern in IOURequestStepConfirmation. The parent re-renders
    // frequently from Onyx subscriptions anyway, and wrapping this properly would require
    // memoizing every handler + all their captured props for no measurable gain.
    const onConfirm = (listOfParticipants: Participant[]) => {
        setIsConfirming(true);
        setSelectedParticipantList(listOfParticipants);

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
            [SUBMIT_HANDLER.SEARCH_PRE_INSERT]: () => handleSearchPreInsert(listOfParticipants),
            [SUBMIT_HANDLER.REPORT_PRE_INSERT]: () => handleReportPreInsert(listOfParticipants),
            [SUBMIT_HANDLER.DISMISS_MODAL]: () => handleDismissModalFastPath(listOfParticipants),
            [SUBMIT_HANDLER.REPORT_IN_RHP_DISMISS]: () => handleReportInRHPDismiss(listOfParticipants),
            [SUBMIT_HANDLER.SEARCH_DISMISS]: () => handleSearchDismiss(listOfParticipants),
            [SUBMIT_HANDLER.DEFAULT]: () => handleDefaultSubmit(listOfParticipants),
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
                        navigateAfterInteraction(() => {
                            createTransaction(selectedParticipantList, true);
                        });
                    }}
                    onDeny={() => {
                        startSubmitSpans();
                        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DEFAULT);
                        updateLastLocationPermissionPrompt();
                        navigateAfterInteraction(() => {
                            createTransaction(selectedParticipantList, false);
                        });
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
