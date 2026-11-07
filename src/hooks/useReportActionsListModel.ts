import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {shouldHidePayAction} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, isReportTransactionThread as isReportTransactionThreadUtil, shouldReportAlignToTop} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useConciergeChatHistoryActions} from '@pages/inbox/ConciergeChatHistoryContext';
import filterHiddenSupportTicketSurveys from '@pages/inbox/report/ReportActionsList/filterHiddenSupportTicketSurveys';

import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {reportActionsListLoadingStateSelector} from '@src/selectors/ReportMetaData';
import type {ReportNameValuePairs} from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

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

const reopenedAsReportIDSelector = (reportNameValuePairs: OnyxEntry<ReportNameValuePairs>) => reportNameValuePairs?.reopenedAsReportID;

/**
 * Single read/derive pipeline for the report-actions list: the subscriptions and derivations the skeleton
 * decision and the list render both need, computed once. Side-effect-free (no writes/navigation/telemetry).
 * The guard calls it once and passes `state`/`actions` via `ReportActionsListStateContext` and
 * `ReportActionsListActionsContext` so the content doesn't re-subscribe.
 */
function useReportActionsListModel(reportID: string, isReportLoadPending: boolean) {
    const {isOffline} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;

    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reopenedAsReportID] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {selector: reopenedAsReportIDSelector});

    const {
        reportActions,
        allReportActions,
        allReportActionIDs,
        persistedReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
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
        reportActions,
        allReportActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        newestFetchedReportActionID: reportPaginationState?.newestFetchedReportActionID,
    });

    const {sortedReportActions, sortedVisibleReportActions, isConciergeHiddenHistory, showConciergeSidePanelWelcome, showFullHistory, hasPreviousMessages, handleShowPreviousMessages} =
        useReportActionsVisibility({
            reportID,
            reportActions,
            allReportActions,
            canPerformWriteAction,
            hasOlderActions,
            loadOlderChats,
            setConciergeShowFullHistory,
        });

    const isMissingReportActions = sortedVisibleReportActions.length === 0;
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
        reportActionsLength: reportActions.length,
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

    // Hidden payments must not affect pagination, loading, or recovery decisions above.
    const paymentFilteredReportActions = report?.isWaitingOnBankAccount ? sortedReportActions.filter((action) => !shouldHidePayAction(action, true)) : sortedReportActions;
    const paymentFilteredVisibleReportActions = report?.isWaitingOnBankAccount
        ? sortedVisibleReportActions.filter((action) => !shouldHidePayAction(action, true))
        : sortedVisibleReportActions;

    const surveyNameValuePairs = {reopenedAsReportID};
    const surveyFilteredReportActions = filterHiddenSupportTicketSurveys({
        reportActions: paymentFilteredReportActions,
        sortedAllReportActions,
        report,
        reportNameValuePairs: surveyNameValuePairs,
    });
    const surveyFilteredVisibleReportActions = filterHiddenSupportTicketSurveys({
        reportActions: paymentFilteredVisibleReportActions,
        sortedAllReportActions,
        report,
        reportNameValuePairs: surveyNameValuePairs,
    });

    // The render state slice on `ReportActionsListStateContext`; this is what drives list re-renders.
    // Ambient state (network, route, archived, concierge chat history) is read locally in the content instead
    // of carried here.
    const state = {
        report,
        hasOnceLoadedReportActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        parentReportAction,
        sortedReportActions: surveyFilteredReportActions,
        sortedVisibleReportActions: surveyFilteredVisibleReportActions,
        // Hidden surveys still prove that the selected page contains the newest action.
        scrollReportActions: paymentFilteredVisibleReportActions,
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
