import {useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useConciergeSidePanelReportActions from '@hooks/useConciergeSidePanelReportActions';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useIsInSidePanel from '@hooks/useIsInSidePanel';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useParentReportAction from '@hooks/useParentReportAction';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useSidePanelState from '@hooks/useSidePanelState';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {getReportPreviewAction} from '@libs/actions/IOU/MoneyRequestBuilder';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getOneTransactionThreadReportID,
    getSortedReportActionsForDisplay,
    isCreatedAction,
    isDeletedParentAction,
    isIOUActionMatchingTransactionList,
    isReportActionVisible,
} from '@libs/ReportActionsUtils';
import {
    canUserPerformWriteAction,
    isConciergeChatReport,
    isInvoiceReport,
    isMoneyRequestReport,
    isReportTransactionThread as isReportTransactionThreadUtil,
    isUnread,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import type ReportScreenNavigationProps from '@pages/inbox/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import getReportActionsToDisplay from './getReportActionsToDisplay';
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

    const [treatAsNoPaginationAnchor, setTreatAsNoPaginationAnchor] = useState(false);
    const nonEmptyReportIDForPages = getNonEmptyStringOnyxID(reportID);
    const [reportActionPages] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_PAGES}${nonEmptyReportIDForPages}`);
    const {
        reportActions: unfilteredReportActions,
        hasNewerActions,
        hasOlderActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
    } = usePaginatedReportActions(reportID, reportActionIDFromRoute, {
        shouldLinkToOldestUnreadReportAction: true,
        treatAsNoPaginationAnchor,
    });
    const allReportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);

    const parentReportAction = useParentReportAction(report);

    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${reportID}`);
    const isLoadingInitialReportActions = reportLoadingState?.isLoadingInitialReportActions;
    const hasOnceLoadedReportActions = reportLoadingState?.hasOnceLoadedReportActions;

    const isInSidePanel = useIsInSidePanel();
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const isConciergeSidePanel = isInSidePanel && isConciergeChatReport(report, conciergeReportID);

    const {sessionStartTime} = useSidePanelState();

    const hasUserSentMessage = useMemo(() => {
        if (!isConciergeSidePanel || !sessionStartTime) {
            return false;
        }
        return allReportActions.some((action) => !isCreatedAction(action) && action.actorAccountID === currentUserAccountID && action.created >= sessionStartTime);
    }, [isConciergeSidePanel, allReportActions, currentUserAccountID, sessionStartTime]);

    const isReportTransactionThread = isReportTransactionThreadUtil(report);

    const [chatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`);
    const allReportTransactions = useReportTransactionsCollection(reportID);
    const reportTransactionsForThreadID = useMemo(
        () => getAllNonDeletedTransactions(allReportTransactions, allReportActions ?? [], isOffline, true),
        [allReportTransactions, allReportActions, isOffline],
    );
    const visibleTransactionsForThreadID = useMemo(
        () => reportTransactionsForThreadID?.filter((transaction) => isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
        [reportTransactionsForThreadID, isOffline],
    );
    const reportTransactionIDsForThread = useMemo(() => visibleTransactionsForThreadID?.map((t) => t.transactionID), [visibleTransactionsForThreadID]);
    const transactionThreadReportID = useMemo(
        () => getOneTransactionThreadReportID(report, chatReport, allReportActions ?? [], isOffline, reportTransactionIDsForThread),
        [report, chatReport, allReportActions, isOffline, reportTransactionIDsForThread],
    );

    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = !!canUserPerformWriteAction(report, isReportArchived);

    const getTransactionThreadReportActions = useCallback(
        (reportActions: OnyxTypes.ReportActions | undefined): OnyxTypes.ReportAction[] => {
            return getSortedReportActionsForDisplay(reportActions, canPerformWriteAction, true, undefined, transactionThreadReportID ?? undefined);
        },
        [canPerformWriteAction, transactionThreadReportID],
    );

    const [transactionThreadReportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        {
            selector: getTransactionThreadReportActions,
        },
        [canPerformWriteAction, transactionThreadReportID],
    );
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
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

    const lastAction = allReportActions?.at(-1);
    const isInitiallyLoadingTransactionThread = isReportTransactionThread && (!!isLoadingInitialReportActions || (allReportActions ?? [])?.length <= 1);

    const shouldAddCreatedAction = !isCreatedAction(lastAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isInitiallyLoadingTransactionThread || isConciergeSidePanel);

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionIDFromRoute || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, reportActionIDFromRoute]);

    // Remount the list when the deep-linked message or unread anchor changes (scroll positioning), or when the report changes.
    const listID = [reportID, reportActionIDFromRoute, hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID].join(':');

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    const reportActionsToDisplay = useMemo(
        () => getReportActionsToDisplay(allReportActions, lastAction, report, reportPreviewAction, transactionThreadReport, shouldAddCreatedAction),
        [allReportActions, lastAction, report, reportPreviewAction, shouldAddCreatedAction, transactionThreadReport],
    );

    // Get a sorted array of reportActions for both the current report and the transaction thread report associated with this report (if there is one)
    // so that we display transaction-level and report-level report actions in order in the one-transaction view
    const reportActions = useMemo(
        () => (reportActionsToDisplay ? getCombinedReportActions(reportActionsToDisplay, transactionThreadReportID ?? null, transactionThreadReportActions ?? []) : []),
        [reportActionsToDisplay, transactionThreadReportActions, transactionThreadReportID],
    );

    const parentReportActionForTransactionThread = useMemo(
        () => (isEmptyObject(transactionThreadReportActions) ? undefined : allReportActions?.find((action) => action.reportActionID === transactionThreadReport?.parentReportActionID)),
        [allReportActions, transactionThreadReportActions, transactionThreadReport?.parentReportActionID],
    );

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

    const allReportActionIDs = useMemo(() => allReportActions?.map((action) => action.reportActionID) ?? [], [allReportActions]);

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs,
        transactionThreadReport,
        hasOlderActions,
        hasNewerActions,
    });

    const {
        filteredVisibleActions: conciergeSidePanelFilteredVisibleActions,
        filteredReportActions: conciergeSidePanelFilteredReportActions,
        showConciergeSidePanelWelcome,
        showFullHistory,
        hasPreviousMessages,
        handleShowPreviousMessages,
    } = useConciergeSidePanelReportActions({
        report,
        reportActions,
        visibleReportActions,
        isConciergeSidePanel,
        hasUserSentMessage,
        hasOlderActions,
        sessionStartTime,
        currentUserAccountID,
        greetingText: translate('common.concierge.sidePanelGreeting'),
        loadOlderChats,
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

    // Show skeleton for the Concierge side panel until report data has been
    // loaded at least once. Before the first openReport response, hasOlderActions
    // is unreliable, so we can't determine whether to show the greeting or
    // onboarding messages. The skeleton avoids flashing wrong content.
    const shouldShowSkeletonForConciergePanel = isConciergeSidePanel && !hasOnceLoadedReportActions && !isOffline;

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
                sortedReportActions={conciergeSidePanelFilteredReportActions}
                sortedVisibleReportActions={conciergeSidePanelFilteredVisibleActions}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                hasNewerActions={hasNewerActions}
                oldestUnreadReportAction={oldestUnreadReportAction}
                sortedAllReportActionsForPagination={sortedAllReportActions ?? []}
                reportActionPages={reportActionPages}
                treatAsNoPaginationAnchor={treatAsNoPaginationAnchor}
                setTreatAsNoPaginationAnchor={setTreatAsNoPaginationAnchor}
                listID={listID}
                hasCreatedActionAdded={shouldAddCreatedAction}
                showHiddenHistory={!showFullHistory}
                hasPreviousMessages={hasPreviousMessages}
                onShowPreviousMessages={handleShowPreviousMessages}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default ReportActionsView;
