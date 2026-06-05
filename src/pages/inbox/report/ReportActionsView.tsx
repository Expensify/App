import {useRoute} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useMemo, useRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import {useCurrentReportIDState} from '@hooks/useCurrentReportID';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsPagination from '@hooks/useReportActionsPagination';
import useReportActionsVisibility from '@hooks/useReportActionsVisibility';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {getReportPreviewAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import {canUserPerformWriteAction, isReportTransactionThread as isReportTransactionThreadUtil, isUnread} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import {useConciergeSessionActions, useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import type ReportScreenNavigationProps from '@pages/inbox/types';
import ONYXKEYS from '@src/ONYXKEYS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ReportActionsList from './ReportActionsList';
import UserTypingEventListener from './UserTypingEventListener';

type ReportActionsViewProps = {
    /** The ID of the report to display actions for */
    reportID: string | undefined;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;
};

function ReportActionsView({reportID, onLayout}: ReportActionsViewProps) {
    const route = useRoute<ReportScreenNavigationProps['route']>();
    const reportActionIDFromRoute = route?.params?.reportActionID;

    useCopySelectionHelper();
    usePendingConciergeResponse(reportID);
    const {isOffline} = useNetwork();

    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const {
        reportActions,
        allReportActions,
        allReportActionIDs,
        hasOlderActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        reportActionPages,
        transactionThreadReportID,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
    } = useReportActionsPagination(reportID, reportActionIDFromRoute);

    const parentReportAction = useParentReportAction(report);

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const isLoadingInitialReportActions = reportLoadingState?.isLoadingInitialReportActions;
    const hasOnceLoadedReportActions = reportLoadingState?.hasOnceLoadedReportActions;

    const {currentReportID} = useCurrentReportIDState();
    const {sessionStartTime: mainDMSessionStartTime, showFullHistory: conciergeShowFullHistory, hadMessagesAtSessionStart: conciergeHadMessagesAtSessionStart} = useConciergeSessionState();
    const {startSession, setShowFullHistory: setConciergeShowFullHistory, setHadMessagesAtSessionStart: setConciergeHadMessagesAtSessionStart} = useConciergeSessionActions();
    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = !!canUserPerformWriteAction(report, isReportArchived);

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);

    const [reportPaginationState] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_PAGINATION_STATE}${reportID}`);

    const reportPreviewAction = useMemo(() => getReportPreviewAction(report?.chatReportID, report?.reportID), [report?.chatReportID, report?.reportID]);
    const didLayout = useRef(false);

    useEffect(() => {
        didLayout.current = false;
    }, [reportID]);

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionIDFromRoute || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, reportActionIDFromRoute]);

    // Remount the list when the deep-linked message or unread anchor changes (scroll positioning), or when the report changes.
    const listID = [reportID, reportActionIDFromRoute, hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID].join(':');

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
        mainDMSessionStartTime,
        conciergeShowFullHistory: conciergeShowFullHistory || !!reportActionIDFromRoute,
        setConciergeShowFullHistory,
        conciergeHadMessagesAtSessionStart,
        setConciergeHadMessagesAtSessionStart,
    });

    useLayoutEffect(() => {
        if (!isConciergeMainDM || !hasOnceLoadedReportActions) {
            return;
        }
        startSession(oldestUnreadReportAction ? report?.lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- startSession is stable; captured values at mount only
    }, [isConciergeMainDM, startSession, hasOnceLoadedReportActions]);

    // On native the component stays mounted in the navigation stack, so the
    // effect above never re-fires (its isConciergeMainDM dep is always true).
    // Re-trigger startSession when the globally-focused report matches this
    // report so the session age check runs after navigating away and back.
    useLayoutEffect(() => {
        if (!isConciergeMainDM || !hasOnceLoadedReportActions || currentReportID !== reportID) {
            return;
        }
        startSession(oldestUnreadReportAction ? report?.lastReadTime : undefined);
        // eslint-disable-next-line react-hooks/exhaustive-deps -- only react to currentReportID returning to this report
    }, [currentReportID, reportID, isConciergeMainDM, hasOnceLoadedReportActions, startSession]);

    const isSingleExpenseReport = reportPreviewAction?.childMoneyRequestCount === 1;
    const isMissingTransactionThreadReportID = !transactionThreadReport?.reportID;
    const isReportDataIncomplete = isSingleExpenseReport && isMissingTransactionThreadReportID;
    const isMissingReportActions = sortedVisibleReportActions.length === 0;

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = (event: LayoutChangeEvent) => {
        onLayout?.(event);
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;

        if (report) {
            markOpenReportEnd(report, {warm: true});
        }
    };

    // Show skeleton while loading initial report actions when data is incomplete/missing and online
    const shouldShowSkeletonForInitialLoad = !!isLoadingInitialReportActions && (isReportDataIncomplete || isMissingReportActions) && !isOffline;

    // Show skeleton while the app is loading and we're online
    const shouldShowSkeletonForAppLoad = isLoadingApp && !isOffline;

    // Show skeleton for the Concierge chat (side panel or main DM) until report
    // data has been loaded at least once. Before the first openReport response,
    // hasOlderActions is unreliable, so we can't determine whether to show the
    // greeting or onboarding messages. The skeleton avoids flashing wrong content.
    const shouldShowSkeletonForConciergePanel = isConciergeHiddenHistory && !hasOnceLoadedReportActions && !isOffline;

    const shouldShowSkeleton = shouldShowSkeletonForConciergePanel || shouldShowSkeletonForInitialLoad || shouldShowSkeletonForAppLoad;

    useEffect(() => {
        if (!shouldShowSkeleton || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowSkeleton]);

    const isReportUnread = isUnread(report, transactionThreadReport, isReportArchived);

    // When opening an unread report, it is very likely that the message we will open to is not the latest,
    // which is the only one we will have in cache.
    const isInitiallyLoadingReport = isReportUnread && !!reportLoadingState?.isLoadingInitialReportActions && reportActions.length <= 1;

    // Same for unread messages, we need to wait for the results from the OpenReport API call
    // if the oldest unread report action is not available yet. Only applies during the *first* load
    // for this report: after `hasOnceLoadedReportActions` is set, a later "mark as unread" must not
    // bring back this loading gate (we are not re-opening the report from a cold cache).
    const isUnreadMessagePageLoadingInitially = !reportActionIDFromRoute && isReportUnread && !oldestUnreadReportAction && !hasOnceLoadedReportActions;

    // Once all the above conditions are met, we can consider the report ready.
    const isReportLoading = isInitiallyLoadingReport || isUnreadMessagePageLoadingInitially;
    const isReportReady = isOffline || !isReportLoading;

    if (isLoadingOnyxValue(reportResult) || !report || !isReportReady || shouldShowSkeleton) {
        return <ReportActionsSkeletonView />;
    }

    const hasDerivedValueTimingIssue = reportActions.length > 0 && isMissingReportActions;
    if ((hasDerivedValueTimingIssue || (!isReportTransactionThread && isMissingReportActions)) && !showConciergeSidePanelWelcome) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    return (
        <>
            <ReportActionsList
                report={report}
                transactionThreadReport={transactionThreadReport}
                parentReportAction={parentReportAction}
                parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={sortedReportActions}
                sortedVisibleReportActions={sortedVisibleReportActions}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                hasNewerActions={hasNewerActions}
                oldestUnreadReportAction={oldestUnreadReportAction}
                sortedAllReportActionsForPagination={sortedAllReportActions ?? []}
                reportActionPages={reportActionPages}
                treatAsNoPaginationAnchor={treatAsNoPaginationAnchor}
                setTreatAsNoPaginationAnchor={setTreatAsNoPaginationAnchor}
                listID={listID}
                showHiddenHistory={isConciergeHiddenHistory && !showFullHistory}
                hasPreviousMessages={hasPreviousMessages}
                onShowPreviousMessages={handleShowPreviousMessages}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default ReportActionsView;
