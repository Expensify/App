import {useRoute} from '@react-navigation/native';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {canUserPerformWriteAction, isReportTransactionThread as isReportTransactionThreadUtil} from '@libs/ReportUtils';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {useConciergeSessionActions, useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import useLoadReportActions from './useLoadReportActions';
import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import useParentReportAction from './useParentReportAction';
import useReportActionsPagination from './useReportActionsPagination';
import useReportActionsVisibility from './useReportActionsVisibility';
import useReportIsArchived from './useReportIsArchived';

/**
 * Single read/derive pipeline for the report-actions list: the subscriptions and derivations the skeleton
 * decision and the list render both need, computed once. Side-effect-free (no writes/navigation/telemetry/
 * session-start). The guard calls it once and passes `contentData` via `ReportActionsDataContext` so the
 * content doesn't re-subscribe.
 */
function useReportActionsData(reportID: string) {
    const {isOffline} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;

    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const {
        reportActions,
        allReportActions,
        allReportActionIDs,
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

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const isLoadingInitialReportActions = reportLoadingState?.isLoadingInitialReportActions;
    const hasOnceLoadedReportActions = reportLoadingState?.hasOnceLoadedReportActions;

    const {sessionStartTime, showFullHistory: conciergeShowFullHistory, hadMessagesAtSessionStart: conciergeHadMessagesAtSessionStart} = useConciergeSessionState();
    const {setShowFullHistory: setConciergeShowFullHistory, setHadMessagesAtSessionStart: setConciergeHadMessagesAtSessionStart} = useConciergeSessionActions();
    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = !!canUserPerformWriteAction(report, isReportArchived);

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const [reportPaginationState] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${reportID}`);

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
        newestFetchedReportActionID: reportPaginationState?.newestFetchedReportActionID,
    });

    const {
        sortedReportActions,
        sortedVisibleReportActions,
        isConciergeMainDM,
        isConciergeHiddenHistory,
        showConciergeSidePanelWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    } = useReportActionsVisibility({
        reportID,
        reportActions,
        allReportActions,
        canPerformWriteAction,
        hasOlderActions,
        loadOlderChats,
        mainDMSessionStartTime: sessionStartTime,
        conciergeShowFullHistory: conciergeShowFullHistory || !!reportActionIDFromRoute || !!report?.hasOutstandingChildTask,
        setConciergeShowFullHistory,
        conciergeHadMessagesAtSessionStart,
        setConciergeHadMessagesAtSessionStart,
    });

    const isMissingReportActions = sortedVisibleReportActions.length === 0;
    const isSingleExpenseReport = reportPreviewAction?.childMoneyRequestCount === 1;
    // allReportActions excludes the synthetic CREATED action always injected for Concierge, so this is
    // false only on a genuinely cold load with no cached history.
    const hasCachedReportActions = allReportActions.length > 0;

    // Guard-only inputs to the skeleton decision (some also read by the guard's effect hooks). Off the
    // context so its churn (loading, app-load, concierge-session, navigation) never re-renders the list.
    const guardData = {
        report,
        reportResult,
        isOffline,
        reportActionIDFromRoute,
        transactionThreadReport,
        isReportArchived,
        isReportTransactionThread,
        isLoadingInitialReportActions,
        hasOnceLoadedReportActions,
        isLoadingApp,
        reportActionsLength: reportActions.length,
        oldestUnreadReportAction,
        isSingleExpenseReport,
        isMissingReportActions,
        isConciergeHiddenHistory,
        isConciergeMainDM,
        hasCachedReportActions,
        showConciergeSidePanelWelcome,
    };

    // The only slice on the context, so it alone drives list re-renders. Ambient state (network, route,
    // archived, concierge session) is read locally in the content instead of carried here.
    const contentData = {
        report,
        hasOnceLoadedReportActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
        parentReportAction,
        sortedReportActions,
        sortedVisibleReportActions,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
        loadOlderChats,
        loadNewerChats,
    };

    return {guardData, contentData};
}

type ReportActionsData = ReturnType<typeof useReportActionsData>;
type ReportActionsGuardData = ReportActionsData['guardData'];
type ReportActionsContentData = ReportActionsData['contentData'];

export default useReportActionsData;
export type {ReportActionsGuardData, ReportActionsContentData};
