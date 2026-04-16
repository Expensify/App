import React, {useState} from 'react';
import {InteractionManager} from 'react-native';
import LocationPermissionModal from '@components/LocationPermissionModal';
import DateUtils from '@libs/DateUtils';
import {flushDeferredWrite, reserveDeferredWriteChannel} from '@libs/deferredLayoutWrite';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportOpenInSuperWideRHP from '@libs/Navigation/helpers/isReportOpenInSuperWideRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import navigateAfterInteraction from '@libs/Navigation/navigateAfterInteraction';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {getReportOrDraftReport} from '@libs/ReportUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import getSubmitExpenseScenario from '@libs/telemetry/getSubmitExpenseScenario';
import {endSubmitFollowUpActionSpan, setFastPath, setPendingSubmitFollowUpAction, startTracking} from '@libs/telemetry/submitFollowUpAction';
import {updateLastLocationPermissionPrompt} from '@userActions/IOU';
import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';

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
 * Encapsulates the submit-expense decision tree: which fast-path handler to
 * use, telemetry lifecycle, navigation orchestration, and the GPS permission
 * flow. Exposes `onConfirm` and `isConfirming` via a render prop so the
 * parent only needs to wire them to `MoneyRequestConfirmationList`.
 *
 * A render-prop component (rather than a hook) is used because this wrapper
 * needs to render `LocationPermissionModal` conditionally. A hook cannot own
 * JSX, so we'd need to return the modal element and have the caller place it
 * - which spreads the concern across two files again.
 *
 * Decision tree (evaluated top to bottom in onConfirm):
 *   isPreInserted && !isReportPreInserted -> handleSearchPreInsert
 *   isReportPreInserted                   -> handleReportPreInsert
 *   canUseDismissModalFastPath()           -> handleDismissModalFastPath
 *   isReportOpenInRHP && destinationID    -> handleReportInRHPDismiss
 *   isFromGlobalCreate && canDismiss      -> handleSearchDismiss
 *   else                                  -> handleDefaultSubmit
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

    const canUseDismissModalFastPath = (rootState: ReturnType<typeof navigationRef.getRootState>): boolean => {
        if (isFromGlobalCreate && !isReportTopmostSplitNavigator()) {
            return false;
        }

        if (isReportOpenInRHP(rootState)) {
            return false;
        }

        if (!isSearchTopmostFullScreenRoute() && !destinationReportID) {
            return false;
        }

        if (destinationReportID && !getReportOrDraftReport(destinationReportID)?.reportID) {
            return false;
        }

        return true;
    };

    // Fast-path handlers use requestAnimationFrame for createTransaction so optimistic Onyx
    // data is applied on the very next frame (before the dismiss animation ends). Flushes and
    // cleanup use InteractionManager.runAfterInteractions to wait until animations complete,
    // avoiding layout thrash from concurrent Onyx writes and navigation transitions.
    const handleSearchPreInsert = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        Navigation.clearFullscreenPreInsertedFlag();
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        Navigation.dismissModal();
        requestAnimationFrame(() => {
            // shouldHandleNavigation defaults to true (unlike other fast paths that pass false).
            // Search pre-insert relies on createTransaction's internal navigation to handle the
            // post-creation flow (navigateAfterExpenseCreate), because the Search screen was
            // pre-inserted before the modal opened - the navigation stack is already correct.
            createTransaction(listOfParticipants);
            setIsConfirming(false);
        });
    };

    const handleReportPreInsert = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.PRE_INSERT, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        Navigation.clearFullscreenPreInsertedFlag();
        setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
        Navigation.dismissModal();
        requestAnimationFrame(() => {
            createTransaction(listOfParticipants, false, false);
            setIsConfirming(false);
        });
    };

    const handleDismissModalFastPath = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.DISMISS_MODAL, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const isDismissOnly = isSearchTopmostFullScreenRoute() || !destinationReportID;

        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);

        if (isDismissOnly) {
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            Navigation.dismissModal();
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
                flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            });
        } else if (getIsNarrowLayout()) {
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, destinationReportID);
            Navigation.dismissModalWithReport({reportID: destinationReportID}, undefined, {
                onBeforeNavigate: (willOpenReport) => {
                    setPendingSubmitFollowUpAction(
                        willOpenReport ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
                        destinationReportID,
                    );
                },
            });
        } else {
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
            Navigation.revealRouteBeforeDismissingModal(ROUTES.REPORT_WITH_ID.getRoute(destinationReportID));
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                flushDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            });
        }

        requestAnimationFrame(() => {
            createTransaction(listOfParticipants, false, false);
            setIsConfirming(false);
        });
    };

    const handleSearchDismiss = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.SEARCH_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const searchType = iouType === CONST.IOU.TYPE.INVOICE ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;
        const isSameType = getCurrentSearchQueryJSON()?.type === searchType;
        setPendingSubmitFollowUpAction(isSameType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
        reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH);
        Navigation.dismissModal();
        requestAnimationFrame(() => {
            createTransaction(listOfParticipants, false, false);
            setIsConfirming(false);
        });
    };

    const handleReportInRHPDismiss = (listOfParticipants: Participant[]) => {
        setFastPath(CONST.TELEMETRY.FAST_PATH_HANDLER.REPORT_IN_RHP_DISMISS, CONST.TELEMETRY.SUBMIT_OPTIMIZATION.DISMISS_FIRST);
        const rootState = navigationRef.getRootState();
        const isSuperWideRHP = isReportOpenInSuperWideRHP(rootState);

        if (isSuperWideRHP) {
            reserveDeferredWriteChannel(CONST.DEFERRED_LAYOUT_WRITE_KEYS.DISMISS_MODAL);
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, destinationReportID);
            Navigation.dismissToPreviousRHP();
        } else if (destinationReportID) {
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, destinationReportID);
            const isNarrowLayout = getIsNarrowLayout();
            if (isNarrowLayout) {
                Navigation.dismissModal();
            } else {
                Navigation.dismissToPreviousRHP();
            }
            Navigation.setNavigationActionToMicrotaskQueue(() => {
                Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID: destinationReportID}), {forceReplace: !isNarrowLayout});
            });
        }

        requestAnimationFrame(() => {
            createTransaction(listOfParticipants, false, false);
            setIsConfirming(false);
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
        const isPreInserted = Navigation.getIsFullscreenPreInsertedUnderRHP();
        const isReportPreInserted = isPreInserted && Navigation.getPreInsertedFullscreenRouteName() === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;

        if (isPreInserted && !isReportPreInserted) {
            handleSearchPreInsert(listOfParticipants);
        } else if (isReportPreInserted) {
            handleReportPreInsert(listOfParticipants);
        } else if (canUseDismissModalFastPath(rootState)) {
            handleDismissModalFastPath(listOfParticipants);
        } else if (isReportOpenInRHP(rootState) && destinationReportID) {
            handleReportInRHPDismiss(listOfParticipants);
        } else if (isFromGlobalCreate && canDismissFromSearch && isSearchTopmostFullScreenRoute()) {
            handleSearchDismiss(listOfParticipants);
        } else {
            handleDefaultSubmit(listOfParticipants);
        }
    };

    return (
        <>
            {!!gpsRequired && (
                <LocationPermissionModal
                    startPermissionFlow={startLocationPermissionFlow}
                    resetPermissionFlow={() => setStartLocationPermissionFlow(false)}
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
