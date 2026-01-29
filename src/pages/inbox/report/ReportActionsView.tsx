import {useIsFocused, useRoute} from '@react-navigation/native';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {InteractionManager} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import usePrevious from '@hooks/usePrevious';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTransactionsAndViolationsForReport from '@hooks/useTransactionsAndViolationsForReport';
import {getReportPreviewAction} from '@libs/actions/IOU';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import DateUtils from '@libs/DateUtils';
import getIsReportFullyVisible from '@libs/getIsReportFullyVisible';
import {getAllNonDeletedTransactions} from '@libs/MoneyRequestReportUtils';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import type {ReportsSplitNavigatorParamList} from '@libs/Navigation/types';
import {generateNewRandomInt, rand64} from '@libs/NumberUtils';
import Performance from '@libs/Performance';
import {
    getCombinedReportActions,
    getMostRecentIOURequestActionID,
    getOriginalMessage,
    getSortedReportActionsForDisplay,
    isCreatedAction,
    isDeletedParentAction,
    isIOUActionMatchingTransactionList,
    isMoneyRequestAction,
    isReportActionVisible,
} from '@libs/ReportActionsUtils';
import {buildOptimisticCreatedReportAction, buildOptimisticIOUReportAction, canUserPerformWriteAction, isInvoiceReport, isMoneyRequestReport} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import ReportActionsList from './ReportActionsList';
import UserTypingEventListener from './UserTypingEventListener';

type ReportActionsViewProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The report metadata loading states */
    isLoadingInitialReportActions?: boolean;

    /** The reportID of the transaction thread report associated with this current report, if any */
    // eslint-disable-next-line react/no-unused-prop-types
    transactionThreadReportID?: string | null;

    /** If the report has newer actions to load */
    hasNewerActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;

    /** If the report is a transaction thread report */
    isReportTransactionThread?: boolean;
};

let listOldID = Math.round(Math.random() * 100);

function ReportActionsView({
    report,
    parentReportAction,
    reportActions: allReportActions,
    isLoadingInitialReportActions,
    transactionThreadReportID,
    hasNewerActions,
    hasOlderActions,
    isReportTransactionThread,
}: ReportActionsViewProps) {
    useCopySelectionHelper();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const isReportArchived = useReportIsArchived(report?.reportID);
    const canPerformWriteAction = useMemo(() => canUserPerformWriteAction(report, isReportArchived), [report, isReportArchived]);

    const getTransactionThreadReportActions = useCallback(
        (reportActions: OnyxEntry<OnyxTypes.ReportActions>): OnyxTypes.ReportAction[] => {
            return getSortedReportActionsForDisplay(reportActions, canPerformWriteAction, true, undefined, transactionThreadReportID);
        },
        [canPerformWriteAction, transactionThreadReportID],
    );

    const [transactionThreadReportActions] = useOnyx(
        `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        {
            selector: getTransactionThreadReportActions,
            canBeMissing: true,
        },
        [getTransactionThreadReportActions],
    );
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`, {canBeMissing: true});
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [visibleReportActionsData] = useOnyx(ONYXKEYS.DERIVED.VISIBLE_REPORT_ACTIONS, {canBeMissing: true});
    const prevTransactionThreadReport = usePrevious(transactionThreadReport);
    const reportActionID = route?.params?.reportActionID;
    const prevReportActionID = usePrevious(reportActionID);
    const reportPreviewAction = useMemo(() => getReportPreviewAction(report.chatReportID, report.reportID), [report.chatReportID, report.reportID]);
    const didLayout = useRef(false);
    const {isOffline} = useNetwork();

    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const isFocused = useIsFocused();
    const [isNavigatingToLinkedMessage, setNavigatingToLinkedMessage] = useState(false);
    const prevShouldUseNarrowLayoutRef = useRef(shouldUseNarrowLayout);
    const reportID = report.reportID;
    const isReportFullyVisible = useMemo((): boolean => getIsReportFullyVisible(isFocused), [isFocused]);
    const {transactions: reportTransactions} = useTransactionsAndViolationsForReport(reportID);
    const reportTransactionIDs = useMemo(
        () => getAllNonDeletedTransactions(reportTransactions, allReportActions ?? []).map((transaction) => transaction.transactionID),
        [reportTransactions, allReportActions],
    );

    const lastAction = allReportActions?.at(-1);
    const isInitiallyLoadingTransactionThread = isReportTransactionThread && (!!isLoadingInitialReportActions || (allReportActions ?? [])?.length <= 1);
    const shouldAddCreatedAction = !isCreatedAction(lastAction) && (isMoneyRequestReport(report) || isInvoiceReport(report) || isInitiallyLoadingTransactionThread);

    useEffect(() => {
        // When we linked to message - we do not need to wait for initial actions - they already exists
        if (!reportActionID || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report.reportID);
    }, [isOffline, report.reportID, reportActionID]);

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

        if (report.total && moneyRequestActions.length < (reportPreviewAction?.childMoneyRequestCount ?? 0) && isEmptyObject(transactionThreadReport)) {
            const optimisticIOUAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: 0,
                currency: CONST.CURRENCY.USD,
                comment: '',
                participants: [],
                transactionID: rand64(),
                iouReportID: report.reportID,
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
        () =>
            isEmptyObject(transactionThreadReportActions)
                ? undefined
                : (allReportActions?.find((action) => action.reportActionID === transactionThreadReport?.parentReportActionID) as OnyxEntry<OnyxTypes.ReportAction>),
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

    const newestReportAction = useMemo(() => reportActions?.at(0), [reportActions]);
    const mostRecentIOUReportActionID = useMemo(() => getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const lastActionCreated = visibleReportActions.at(0)?.created;
    const isNewestAction = (actionCreated: string | undefined, lastVisibleActionCreated: string | undefined) =>
        actionCreated && lastVisibleActionCreated ? actionCreated >= lastVisibleActionCreated : actionCreated === lastVisibleActionCreated;
    const hasNewestReportAction = isNewestAction(lastActionCreated, report.lastVisibleActionCreated) || isNewestAction(lastActionCreated, transactionThreadReport?.lastVisibleActionCreated);

    const isSingleExpenseReport = reportPreviewAction?.childMoneyRequestCount === 1;
    const isMissingTransactionThreadReportID = !transactionThreadReport?.reportID;
    const isReportDataIncomplete = isSingleExpenseReport && isMissingTransactionThreadReportID;
    const isMissingReportActions = visibleReportActions.length === 0;

    useEffect(() => {
        // update ref with current state
        prevShouldUseNarrowLayoutRef.current = shouldUseNarrowLayout;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [shouldUseNarrowLayout, reportActions, isReportFullyVisible]);

    const allReportActionIDs = useMemo(() => {
        return allReportActions?.map((action) => action.reportActionID) ?? [];
    }, [allReportActions]);

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActionID,
        reportActions,
        allReportActionIDs,
        transactionThreadReport,
        hasOlderActions,
        hasNewerActions,
    });

    /**
     * Runs when the FlatList finishes laying out
     */
    const recordTimeToMeasureItemLayout = useCallback(() => {
        if (didLayout.current) {
            return;
        }

        didLayout.current = true;

        markOpenReportEnd(report);
    }, [report]);

    // Check if the first report action in the list is the one we're currently linked to
    const isTheFirstReportActionIsLinked = newestReportAction?.reportActionID === reportActionID;

    useEffect(() => {
        let timerID: NodeJS.Timeout;

        if (!isTheFirstReportActionIsLinked && reportActionID) {
            setNavigatingToLinkedMessage(true);
            // After navigating to the linked reportAction, apply this to correctly set
            // `autoscrollToTopThreshold` prop when linking to a specific reportAction.
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            InteractionManager.runAfterInteractions(() => {
                // Using a short delay to ensure the view is updated after interactions
                timerID = setTimeout(() => setNavigatingToLinkedMessage(false), 10);
            });
        } else {
            setNavigatingToLinkedMessage(false);
        }

        return () => {
            if (!timerID) {
                return;
            }
            clearTimeout(timerID);
        };
    }, [isTheFirstReportActionIsLinked, reportActionID]);

    // Show skeleton while loading initial report actions when data is incomplete/missing and online
    const shouldShowSkeletonForInitialLoad = isLoadingInitialReportActions && (isReportDataIncomplete || isMissingReportActions) && !isOffline;

    // Show skeleton while the app is loading and we're online
    const shouldShowSkeletonForAppLoad = isLoadingApp && !isOffline;

    if (shouldShowSkeletonForInitialLoad ?? shouldShowSkeletonForAppLoad) {
        return <ReportActionsSkeletonView />;
    }

    const hasDerivedValueTimingIssue = reportActions.length > 0 && isMissingReportActions;
    if (hasDerivedValueTimingIssue || (!isReportTransactionThread && isMissingReportActions)) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    // AutoScroll is disabled when we do linking to a specific reportAction
    const shouldEnableAutoScroll = (hasNewestReportAction && (!reportActionID || !isNavigatingToLinkedMessage)) || (transactionThreadReport && !prevTransactionThreadReport);
    return (
        <>
            <ReportActionsList
                report={report}
                transactionThreadReport={transactionThreadReport}
                parentReportAction={parentReportAction}
                parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                onLayout={recordTimeToMeasureItemLayout}
                sortedReportActions={reportActions}
                sortedVisibleReportActions={visibleReportActions}
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                loadOlderChats={loadOlderChats}
                loadNewerChats={loadNewerChats}
                listID={listID}
                shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScroll}
                hasCreatedActionAdded={shouldAddCreatedAction}
            />
            <UserTypingEventListener report={report} />
        </>
    );
}

export default Performance.withRenderTrace({id: '<ReportActionsView> rendering'})(ReportActionsView);
