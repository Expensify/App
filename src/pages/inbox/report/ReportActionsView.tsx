import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef} from 'react';
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
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSidePanelState from '@hooks/useSidePanelState';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {getReportPreviewAction} from '@libs/actions/IOU';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import DateUtils from '@libs/DateUtils';
import getIsReportFullyVisible from '@libs/getIsReportFullyVisible';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {generateNewRandomInt, rand64} from '@libs/NumberUtils';
import {
    getCombinedReportActions,
    getFilteredReportActionsForReportView,
    getOneTransactionThreadReportID,
    getOriginalMessage,
    getSortedReportActionsForDisplay,
    isCreatedAction,
    isDeletedParentAction,
    isIOUActionMatchingTransactionList,
    isMoneyRequestAction,
    isReportActionVisible,
} from '@libs/ReportActionsUtils';
import {
    buildOptimisticCreatedReportAction,
    buildOptimisticIOUReportAction,
    canUserPerformWriteAction,
    isConciergeChatReport,
    isInvoiceReport,
    isMoneyRequestReport,
    isReportTransactionThread as isReportTransactionThreadUtil,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';
import ReportActionsList from './ReportActionsList';
import UserTypingEventListener from './UserTypingEventListener';

type ReportActionsViewProps = {
    /** The ID of the report to display actions for */
    reportID: string | undefined;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;
};

let listOldID = Math.round(Math.random() * 100);

function ReportActionsView({reportID, onLayout}: ReportActionsViewProps) {
    useCopySelectionHelper();
    const {translate} = useLocalize();
    usePendingConciergeResponse(reportID);
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const {isOffline} = useNetwork();

    const [report, reportResult] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);

    const reportActionID = route?.params?.reportActionID;
    const {reportActions: unfilteredReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID, reportActionID);
    const allReportActions = useMemo(() => getFilteredReportActionsForReportView(unfilteredReportActions), [unfilteredReportActions]);

    const parentReportAction = useParentReportAction(report);

    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;
    const hasOnceLoadedReportActions = reportMetadata?.hasOnceLoadedReportActions;

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
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

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
        [getTransactionThreadReportActions],
    );
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS);
    const prevReportActionID = usePrevious(reportActionID);
    const reportPreviewAction = useMemo(() => getReportPreviewAction(report?.chatReportID, report?.reportID), [report?.chatReportID, report?.reportID]);
    const didLayout = useRef(false);

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const prevShouldUseNarrowLayoutRef = useRef(shouldUseNarrowLayout);
    const isReportFullyVisible = useMemo(() => getIsReportFullyVisible(isFocused), [isFocused]);
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(reportID);
    const reportTransactionIDs = useMemo(
        () => getAllNonDeletedTransactions(reportTransactions, allReportActions ?? []).map((transaction) => transaction.transactionID),
        [reportTransactions, allReportActions],
    );

    const lastAction = allReportActions?.at(-1);
    const isInitiallyLoadingTransactionThread = isReportTransactionThread && (!!isLoadingInitialReportActions || (allReportActions ?? [])?.length <= 1);
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldAddCreatedAction = !isCreatedAction(lastAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isInitiallyLoadingTransactionThread || isConciergeSidePanel);

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionID || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, reportActionID]);

    // Change the list ID only for comment linking to get the positioning right
    const listID = useMemo(() => {
        if (!reportActionID && !prevReportActionID) {
            // Keep the old list ID since we're not in the Comment Linking flow
            return listOldID;
        }
        const newID = generateNewRandomInt(listOldID, 1, Number.MAX_SAFE_INTEGER);
        listOldID = newID;

        return newID;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, reportActionID]);

    // When we are offline before opening an IOU/Expense report,
    // the total of the report and sometimes the expense aren't displayed because these actions aren't returned until `OpenReport` API is complete.
    // We generate a fake created action here if it doesn't exist to display the total whenever possible because the total just depends on report data
    // and we also generate an expense action if the number of expenses in allReportActions is less than the total number of expenses
    // to display at least one expense action to match the total data.
    const reportActionsToDisplay = useMemo(() => {
        const actions = [...(allReportActions ?? [])];

        if (shouldAddCreatedAction) {
            const createdTime = lastAction?.created && DateUtils.subtractMillisecondsFromDateTime(lastAction.created, 1);
            const optimisticCreatedAction = buildOptimisticCreatedReportAction(String(report?.ownerAccountID), createdTime);
            optimisticCreatedAction.pendingAction = null;
            actions.push(optimisticCreatedAction);
        }

        if (!isMoneyRequestReport(report) || !allReportActions?.length) {
            return actions;
        }

        const moneyRequestActions = allReportActions.filter((action) => {
            const originalMessage = isMoneyRequestAction(action) ? getOriginalMessage(action) : undefined;
            return (
                isMoneyRequestAction(action) &&
                originalMessage &&
                (originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE ||
                    !!(originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && originalMessage?.IOUDetails) ||
                    originalMessage?.type === CONST.IOU.REPORT_ACTION_TYPE.TRACK)
            );
        });

        if (report?.total && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0) && isEmptyObject(transactionThreadReport)) {
            const optimisticIOUAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 0,
                currency: CONST.CURRENCY.USD,
                comment: '',
                participants: [],
                transactionID: rand64(),
                iouReportID: report?.reportID,
                created: DateUtils.subtractMillisecondsFromDateTime(actions.at(-1)?.created ?? '', 1),
            }) as OnyxTypes.ReportAction;
            moneyRequestActions.push(optimisticIOUAction);
            actions.splice(actions.length - 1, 0, optimisticIOUAction);
        }

        // Update pending action of created action if we have some requests that are pending
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const createdAction = actions.pop()!;
        if (moneyRequestActions.filter((action) => !!action.pendingAction).length > 0) {
            createdAction.pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;
        }

        return [...actions, createdAction];
    }, [allReportActions, shouldAddCreatedAction, report, reportPreviewAction?.childMoneyRequestCount, transactionThreadReport, lastAction?.created]);

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
        [reportActions, isOffline, canPerformWriteAction, reportTransactionIDs, visibleReportActionsData, reportID],
    );

    const isSingleExpenseReport = reportPreviewAction?.childMoneyRequestCount === 1;
    const isMissingTransactionThreadReportID = !transactionThreadReport?.reportID;
    const isReportDataIncomplete = isSingleExpenseReport && isMissingTransactionThreadReportID;
    const isMissingReportActions = visibleReportActions.length === 0;

    useEffect(() => {
        // update ref with current state
        prevShouldUseNarrowLayoutRef.current = shouldUseNarrowLayout;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout, reportActions, isReportFullyVisible]);

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
    const shouldShowSkeletonForInitialLoad = isLoadingInitialReportActions && (isReportDataIncomplete || isMissingReportActions) && !isOffline;

    // Show skeleton while the app is loading and we're online
    const shouldShowSkeletonForAppLoad = isLoadingApp && !isOffline;

    // Show skeleton for the Concierge side panel until report data has been
    // loaded at least once. Before the first openReport response, hasOlderActions
    // is unreliable, so we can't determine whether to show the greeting or
    // onboarding messages. The skeleton avoids flashing wrong content.
    const shouldShowSkeletonForConciergePanel = isConciergeSidePanel && !hasOnceLoadedReportActions && !isOffline;

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const shouldShowSkeleton = shouldShowSkeletonForConciergePanel || shouldShowSkeletonForInitialLoad || shouldShowSkeletonForAppLoad;

    useEffect(() => {
        if (!shouldShowSkeleton || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowSkeleton]);

    if (isLoadingOnyxValue(reportResult) || !report) {
        return <ReportActionsSkeletonView />;
    }

    if (shouldShowSkeleton) {
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
                listID={listID}
                hasCreatedActionAdded={shouldAddCreatedAction}
                isConciergeSidePanel={isConciergeSidePanel}
                showHiddenHistory={!showFullHistory}
                hasPreviousMessages={hasPreviousMessages}
                onShowPreviousMessages={handleShowPreviousMessages}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default ReportActionsView;
