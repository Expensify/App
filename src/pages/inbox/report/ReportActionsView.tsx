import {useRoute} from '@react-navigation/native';
import React, {useEffect, useMemo, useRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useConciergeSessionStartTime from '@hooks/useConciergeSessionStartTime';
import useConciergeReportActions from '@hooks/useConciergeSidePanelReportActions';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsPagination from '@hooks/useReportActionsPagination';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {getReportPreviewAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {isCreatedAction, isDeletedParentAction, isIOUActionMatchingTransactionList, isReportActionVisible} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, isConciergeChatReport, isReportTransactionThread as isReportTransactionThreadUtil, isUnread} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import type ReportScreenNavigationProps from '@pages/inbox/types';
import CONST from '@src/CONST';
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
    const {translate} = useLocalize();
    usePendingConciergeResponse(reportID);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
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

    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeChat = isConciergeChatReport(report, conciergeReportID);
    const sessionStartTime = useConciergeSessionStartTime(isConciergeChat, report?.lastReadTime);

    const hasUserSentMessage = useMemo(() => {
        if (!isConciergeChat || !sessionStartTime) {
            return false;
        }
        return allReportActions.some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created > sessionStartTime);
    }, [isConciergeChat, allReportActions, currentUserAccountID, sessionStartTime]);

    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = !!canUserPerformWriteAction(report, isReportArchived);

    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const reportPreviewAction = useMemo(() => getReportPreviewAction(report?.chatReportID, report?.reportID), [report?.chatReportID, report?.reportID]);
    const didLayout = useRef(false);

    useEffect(() => {
        didLayout.current = false;
    }, [reportID]);

    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(reportID);
    const reportTransactionIDs = useMemo(
        () => getAllNonDeletedTransactions(reportTransactions, allReportActions ?? []).map((transaction) => transaction.transactionID),
        [reportTransactions, allReportActions],
    );

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionIDFromRoute || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, reportActionIDFromRoute]);

    // Remount the list when the deep-linked message or unread anchor changes (scroll positioning), or when the report changes.
    const listID = [reportID, reportActionIDFromRoute, hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID].join(':');

    const visibleReportActions = useMemo(
        () =>
            reportActions.filter((reportAction) => {
                const passesOfflineCheck =
                    isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors;

                if (!passesOfflineCheck) {
                    return false;
                }

                const actionReportID = reportAction.reportID ?? reportID;
                if (!isReportActionVisible(reportAction, actionReportID, canPerformWriteAction, visibleReportActionsData)) {
                    return false;
                }

                if (!isIOUActionMatchingTransactionList(reportAction, reportTransactionIDs)) {
                    return false;
                }

                return true;
            }),
        [canPerformWriteAction, isOffline, reportActions, reportID, reportTransactionIDs, visibleReportActionsData],
    );

    const isSingleExpenseReport = reportPreviewAction?.childMoneyRequestCount === 1;
    const isMissingTransactionThreadReportID = !transactionThreadReport?.reportID;
    const isReportDataIncomplete = isSingleExpenseReport && isMissingTransactionThreadReportID;
    const isMissingReportActions = visibleReportActions.length === 0;

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs,
        transactionThreadReportID,
        hasOlderActions,
        hasNewerActions,
    });

    const {
        filteredVisibleActions: conciergeFilteredVisibleActions,
        filteredReportActions: conciergeFilteredReportActions,
        showConciergeWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    } = useConciergeReportActions({
        report,
        reportActions,
        visibleReportActions,
        isConciergeChat,
        hasUserSentMessage,
        hasOlderActions,
        sessionStartTime,
        currentUserAccountID,
        greetingText: translate('common.concierge.greeting'),
        loadOlderChats,
        reportActionIDFromRoute,
    });

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

    // Show skeleton for the Concierge chat until report data has been
    // loaded at least once. Before the first openReport response, hasOlderActions
    // is unreliable, so we can't determine whether to show the greeting or
    // onboarding messages. The skeleton avoids flashing wrong content.
    const shouldShowSkeletonForConciergeChat = isConciergeChat && !hasOnceLoadedReportActions && !isOffline;

    const shouldShowSkeleton = shouldShowSkeletonForConciergeChat || shouldShowSkeletonForInitialLoad || shouldShowSkeletonForAppLoad;

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
    if ((hasDerivedValueTimingIssue || (!isReportTransactionThread && isMissingReportActions)) && !showConciergeWelcome) {
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
                sortedReportActions={conciergeFilteredReportActions}
                sortedVisibleReportActions={conciergeFilteredVisibleActions}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                hasNewerActions={hasNewerActions}
                oldestUnreadReportAction={oldestUnreadReportAction}
                sortedAllReportActionsForPagination={sortedAllReportActions ?? []}
                reportActionPages={reportActionPages}
                treatAsNoPaginationAnchor={treatAsNoPaginationAnchor}
                setTreatAsNoPaginationAnchor={setTreatAsNoPaginationAnchor}
                listID={listID}
                showHiddenHistory={!showFullHistory}
                hasPreviousMessages={hasPreviousMessages}
                onShowPreviousMessages={handleShowPreviousMessages}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default ReportActionsView;
