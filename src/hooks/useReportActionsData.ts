import {useRoute} from '@react-navigation/native';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {canUserPerformWriteAction, isReportTransactionThread as isReportTransactionThreadUtil} from '@libs/ReportUtils';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {useConciergeSessionActions, useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {useCurrentReportIDState} from './useCurrentReportID';
import useLoadReportActions from './useLoadReportActions';
import useNetworkWithOfflineStatus from './useNetworkWithOfflineStatus';
import useOnyx from './useOnyx';
import useParentReportAction from './useParentReportAction';
import useReportActionsPagination from './useReportActionsPagination';
import useReportActionsVisibility from './useReportActionsVisibility';
import useReportIsArchived from './useReportIsArchived';

/**
 * Read/derive-only data pipeline for the report-actions list.
 *
 * Bundles every subscription + derivation needed for both the skeleton decision and the list render, so
 * the guard's decision and the content's render share one pipeline. Intentionally side-effect-free: NO
 * Onyx writes, navigation, telemetry, or session-start. `ReportActionsSkeletonGuard` calls this once and
 * provides the result via `ReportActionsDataContext`, so the content reads it instead of subscribing again.
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

    const {currentReportID} = useCurrentReportIDState();
    const {sessionStartTime, showFullHistory: conciergeShowFullHistory, hadMessagesAtSessionStart: conciergeHadMessagesAtSessionStart} = useConciergeSessionState();
    const {startSession, setShowFullHistory: setConciergeShowFullHistory, setHadMessagesAtSessionStart: setConciergeHadMessagesAtSessionStart} = useConciergeSessionActions();
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

    // hasOnceLoadedReportActions is RAM-only and resets to falsy on a page
    // refresh, but cached report actions persist in Onyx. Gating the session
    // start on it alone would leave sessionStartTime null until openReport
    // returns, during which filterActions collapses the cached history down to
    // just the synthetic CREATED action (an almost-empty chat flash). Start the
    // session as soon as cached actions exist so messages render immediately on
    // refresh, matching the concierge skeleton condition.
    const canStartConciergeSession = !!hasOnceLoadedReportActions || allReportActions.length > 0;

    // What the skeleton decision (`computeReportActionsSkeletonState`) and the guard's effects read. The
    // guard consumes this locally; it is never put on the context, so changes to these (loading flags,
    // app-load, concierge-session start, navigation) do not re-render the list content.
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
        reportActions,
        oldestUnreadReportAction,
        reportPreviewAction,
        sortedVisibleReportActions,
        isConciergeHiddenHistory,
        isConciergeMainDM,
        allReportActions,
        showConciergeSidePanelWelcome,
        canStartConciergeSession,
        startSession,
        currentReportID,
    };

    // The report-actions pipeline outputs the list needs. This is the only slice carried through
    // `ReportActionsDataContext`. `report` and `hasOnceLoadedReportActions` stay here even though they look
    // ambient: this hook already subscribes to them, and the list's pipeline derivations were built from
    // this `report`, so re-reading them in the content would only add a duplicate subscription and split
    // `report` from its own derivations. Truly ambient state (network, route, archived, concierge session)
    // is read locally in the content instead, since it adds no subscription the pipeline doesn't hold.
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
export type {ReportActionsData, ReportActionsGuardData, ReportActionsContentData};
