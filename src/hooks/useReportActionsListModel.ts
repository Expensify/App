import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {canUserPerformWriteAction, isReportTransactionThread as isReportTransactionThreadUtil, shouldReportAlignToTop} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useConciergeChatHistoryActions} from '@pages/inbox/ConciergeChatHistoryContext';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {reportActionsListLoadingStateSelector} from '@src/selectors/ReportMetaData';

import {useRoute} from '@react-navigation/native';

import useConciergeAskState from './useConciergeAskState';
import {useIsAppLoadPending} from './useInFlightRequests';
import useLoadReportActions from './useLoadReportActions';
import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import useParentReportAction from './useParentReportAction';
import useReportActionsPagination from './useReportActionsPagination';
import useReportActionsVisibility from './useReportActionsVisibility';
import {useDerivedIsEmptyReport} from './useReportAttributes';
import useReportIsArchived from './useReportIsArchived';

/**
 * Single read/derive pipeline for the report-actions list: the subscriptions and derivations the skeleton
 * decision and the list render both need, computed once. Side-effect-free (no writes/navigation/telemetry).
 * The guard calls it once and passes `state`/`actions` via `ReportActionsListStateContext` and
 * `ReportActionsListActionsContext` so the content doesn't re-subscribe.
 *
 * The actions pass through these arrays, each newest first:
 * - `cachedActions`: every stored action of the report, hidden ones included.
 * - `reportViewActions`: the loaded window of `cachedActions`, without deleted expenses and hidden report previews.
 * - `combinedActions`: `reportViewActions` merged with the one-expense thread's actions, plus placeholder rows while the report loads.
 * - `listActions`: the `combinedActions` the list works with, hidden ones included. See `useReportActionsVisibility`.
 * - `visibleActions`: the `listActions` that render as rows.
 * The list then adds a streamed Concierge reply (`visibleActionsWithDraft`) and collapses system messages (`listData`).
 */
function useReportActionsListModel(reportID: string, isReportLoadPending: boolean) {
    const {isOffline} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;

    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const {
        cachedActions,
        reportViewActions,
        reportViewActionIDs,
        combinedActions,
        persistedReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        oldestUnreadReportAction,
        transactionThreadReportID,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
        reportPreviewAction,
    } = useReportActionsPagination(reportID, reportActionIDFromRoute);

    const parentReportAction = useParentReportAction(report);

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`, {
        selector: reportActionsListLoadingStateSelector,
    });
    const hasOnceLoadedReportActions = reportLoadingState?.hasOnceLoadedReportActions;
    const isLoadingInitialReportActions = reportLoadingState?.isLoadingInitialReportActions;
    const isLoadingOlderReportActions = reportLoadingState?.isLoadingOlderReportActions;
    const hasLoadingOlderReportActionsError = reportLoadingState?.hasLoadingOlderReportActionsError;

    const {setShowFullHistory: setConciergeShowFullHistory} = useConciergeChatHistoryActions();
    const {
        shouldShowWelcome: shouldShowConciergeWelcome,
        isHistoryExpanded: isConciergeHistoryExpanded,
        hasUnreadMessageFromOthers: hasUnreadConciergeMessageFromOthers,
    } = useConciergeAskState(reportID);
    const isReportTransactionThread = isReportTransactionThreadUtil(report);
    const shouldBeAlignedToTop = shouldReportAlignToTop(report, parentReportAction);

    const isReportArchived = useReportIsArchived(reportID);
    const derivedIsEmptyReport = useDerivedIsEmptyReport(reportID);
    const canPerformWriteAction = !!canUserPerformWriteAction(report, isReportArchived);

    const isAppLoadPending = useIsAppLoadPending();

    const [reportPaginationState] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${reportID}`);

    const {loadOlderChats, loadNewerChats, currentReportOldestActionID} = useLoadReportActions({
        reportID,
        reportActions: combinedActions,
        parentReportActionIDs: reportViewActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        newestFetchedReportActionID: reportPaginationState?.newestFetchedReportActionID,
    });

    const {
        listActions,
        visibleActions,
        visibleActionsWithHiddenSurveys,
        isConciergeHiddenHistory,
        showConciergeSidePanelWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    } = useReportActionsVisibility({
        reportID,
        cachedActions,
        reportViewActions,
        combinedActions,
        canPerformWriteAction,
        hasOlderActions,
        loadOlderChats,
        setConciergeShowFullHistory,
    });

    const isMissingReportActions = visibleActions.length === 0;
    const isSingleExpenseReport = reportPreviewAction?.childMoneyRequestCount === 1;

    // Readiness signals for the skeleton decision (some also read by the guard's effect hooks). Off the
    // context so their churn (loading, app-load, navigation) never re-renders the list.
    const readinessSignals = {
        report,
        reportResult,
        isOffline,
        reportActionIDFromRoute,
        transactionThreadReport,
        isReportArchived,
        isReportTransactionThread,
        shouldBeAlignedToTop,
        isReportLoadPending,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        hasOnceLoadedReportActions,
        isLoadingInitialReportActions,
        isLoadingApp: isAppLoadPending,
        combinedActionsLength: combinedActions.length,
        oldestReportActionID: currentReportOldestActionID,
        hasOlderActions,
        hasNewerActions,
        oldestUnreadReportAction,
        isSingleExpenseReport,
        isMissingReportActions,
        isConciergeHiddenHistory,
        showConciergeSidePanelWelcome,
        derivedIsEmptyReport,
        hasUnreadConciergeMessageFromOthers,
    };

    // The render state slice on `ReportActionsListStateContext`; this is what drives list re-renders.
    // Ambient state (network, route, archived, concierge chat history) is read locally in the content instead
    // of carried here.
    const state = {
        report,
        hasOnceLoadedReportActions,
        hasNewerActions,
        cachedActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        parentReportAction,
        listActions,
        visibleActions,
        visibleActionsWithHiddenSurveys,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
        persistedReportActionIDs,
        shouldShowConciergeWelcome,
        isConciergeHistoryExpanded,
    };

    // The command handles on `ReportActionsListActionsContext`. Referentially stable, so actions-only
    // consumers don't re-render when the state slice churns.
    const actions = {
        setTreatAsNoPaginationAnchor,
        handleShowPreviousMessages,
        loadOlderChats,
        loadNewerChats,
    };

    return {readinessSignals, state, actions};
}

type ReportActionsListModel = ReturnType<typeof useReportActionsListModel>;
type ReportActionsReadinessSignals = ReportActionsListModel['readinessSignals'];
type ReportActionsListState = ReportActionsListModel['state'];
type ReportActionsListActions = ReportActionsListModel['actions'];

export default useReportActionsListModel;
export type {ReportActionsReadinessSignals, ReportActionsListState, ReportActionsListActions};
