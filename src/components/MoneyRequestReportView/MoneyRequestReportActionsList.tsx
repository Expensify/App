import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import React, {useCallback, useMemo} from 'react';
import {InteractionManager, View} from 'react-native';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FlatList from '@components/FlatList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getFirstVisibleReportActionID,
    getMostRecentIOURequestActionID,
    getOneTransactionThreadReportID,
    hasNextActionMadeBySameActor,
    isConsecutiveChronosAutomaticTimerAction,
    isDeletedParentAction,
    isReversedTransaction,
    isTransactionThread,
    shouldReportActionBeVisible,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID, isCanceledTaskReport, isExpenseReport, isInvoiceReport, isIOUReport, isTaskReport} from '@libs/ReportUtils';
import isSearchTopmostFullScreenRoute from '@navigation/helpers/isSearchTopmostFullScreenRoute';
import ReportActionsListItemRenderer from '@pages/home/report/ReportActionsListItemRenderer';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';

/**
 * In this view we are not handling the special single transaction case, we're just handling the report
 */
const EmptyParentReportActionForTransactionThread = undefined;

type MoneyRequestReportListProps = {
    /** The report */
    report: OnyxTypes.Report;

    /** Array of report actions for this report */
    reportActions?: OnyxTypes.ReportAction[];

    /** If the report has newer actions to load */
    hasNewerActions: boolean;

    /** If the report has older actions to load */
    hasOlderActions: boolean;
};

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

function isChatOnlyReportAction(action: OnyxTypes.ReportAction) {
    return action.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU && action.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED;
}

function getTransactionsForReportID(transactions: OnyxCollection<OnyxTypes.Transaction>, reportID: string) {
    return Object.values(transactions ?? {}).filter((transaction): transaction is Transaction => {
        return transaction?.reportID === reportID;
    });
}

/**
 * TODO make this component have the same functionalities as `ReportActionsList`
 *  - onLayout
 *  - onScroll
 *  - onScrollToIndexFailed
 *  - shouldEnableAutoScrollToTopThreshold
 *  - shouldDisplayNewMarker
 *  - shouldHideThreadDividerLine
 */
function MoneyRequestReportActionsList({report, reportActions = [], hasNewerActions, hasOlderActions}: MoneyRequestReportListProps) {
    const styles = useThemeStyles();
    const {isOffline} = useNetwork();

    const reportID = report?.reportID;

    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(report?.parentReportID)}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, report?.parentReportActionID),
    });

    const mostRecentIOUReportActionID = useMemo(() => getMostRecentIOURequestActionID(reportActions), [reportActions]);
    const transactionThreadReportID = getOneTransactionThreadReportID(reportID, reportActions ?? [], false);
    const firstVisibleReportActionID = useMemo(() => getFirstVisibleReportActionID(reportActions, isOffline), [reportActions, isOffline]);
    const [transactions = []] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION, {
        selector: (allTransactions): OnyxTypes.Transaction[] => getTransactionsForReportID(allTransactions, reportID),
    });
    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID ?? CONST.DEFAULT_NUMBER_ID}`);

    const canPerformWriteAction = canUserPerformWriteAction(report);

    // We are reversing actions because in this View we are starting at the top and don't use Inverted list
    const visibleReportActions = useMemo(() => {
        const filteredActions = reportActions.filter((reportAction) => {
            const isChatAction = isChatOnlyReportAction(reportAction);

            return (
                isChatAction &&
                (isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors) &&
                shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canPerformWriteAction)
            );
        });

        return filteredActions.toReversed();
    }, [reportActions, isOffline, canPerformWriteAction]);

    const reportActionIDs = useMemo(() => {
        return reportActions?.map((action) => action.reportActionID) ?? [];
    }, [reportActions]);

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions,
        allReportActionIDs: reportActionIDs,
        transactionThreadReport,
        hasOlderActions,
        hasNewerActions,
    });

    const onStartReached = useCallback(() => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        InteractionManager.runAfterInteractions(() => requestAnimationFrame(() => loadNewerChats(false)));
    }, [loadNewerChats]);

    const onEndReached = useCallback(() => {
        loadOlderChats(false);
    }, [loadOlderChats]);

    const shouldUseThreadDividerLine = useMemo(() => {
        const topReport = reportActions.length > 0 ? reportActions.at(reportActions.length - 1) : null;

        if (topReport && topReport.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return false;
        }

        if (isTransactionThread(parentReportAction)) {
            return !isDeletedParentAction(parentReportAction) && !isReversedTransaction(parentReportAction);
        }

        if (isTaskReport(report)) {
            return !isCanceledTaskReport(report, parentReportAction);
        }

        return isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    }, [parentReportAction, report, reportActions]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
            const displayAsGroup =
                !isConsecutiveChronosAutomaticTimerAction(visibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID)) &&
                hasNextActionMadeBySameActor(visibleReportActions, index);

            return (
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    reportActions={reportActions}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={EmptyParentReportActionForTransactionThread}
                    index={index}
                    report={report}
                    transactionThreadReport={transactionThreadReport}
                    displayAsGroup={displayAsGroup}
                    mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                    shouldDisplayNewMarker={false}
                    shouldHideThreadDividerLine
                    shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                    shouldDisplayReplyDivider={visibleReportActions.length > 1}
                    isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                />
            );
        },
        [visibleReportActions, reportActions, parentReportAction, report, transactionThreadReport, mostRecentIOUReportActionID, shouldUseThreadDividerLine, firstVisibleReportActionID],
    );

    return (
        <View style={styles.flex1}>
            {report ? (
                <FlatList
                    accessibilityLabel="Test"
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={visibleReportActions}
                    renderItem={renderItem}
                    keyExtractor={(item) => item.reportActionID}
                    initialNumToRender={10}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={onStartReached}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={<MoneyRequestReportTransactionList transactions={transactions} />}
                    keyboardShouldPersistTaps="handled"
                />
            ) : (
                <ReportActionsSkeletonView />
            )}
        </View>
    );
}

MoneyRequestReportActionsList.displayName = 'MoneyRequestReportActionsList';

export default MoneyRequestReportActionsList;
