import type {ListRenderItemInfo} from '@react-native/virtualized-lists/Lists/VirtualizedList';
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FlatList from '@components/FlatList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import usePaginatedReportActions from '@hooks/usePaginatedReportActions';
import useThemeStyles from '@hooks/useThemeStyles';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {
    getMostRecentIOURequestActionID,
    getOneTransactionThreadReportID,
    getSortedReportActionsForDisplay,
    isConsecutiveActionMadeByPreviousActor,
    isConsecutiveChronosAutomaticTimerAction,
    isDeletedParentAction,
    shouldReportActionBeVisible,
} from '@libs/ReportActionsUtils';
import {canUserPerformWriteAction, chatIncludesChronosWithID} from '@libs/ReportUtils';
import ReportActionsListItemRenderer from '@pages/home/report/ReportActionsListItemRenderer';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MoneyRequestReportTransactionList from './MoneyRequestReportTransactionList';

type TemporaryMoneyRequestReportViewProps = {
    /** The report */
    report: OnyxEntry<OnyxTypes.Report>;
};

function getParentReportAction(parentReportActions: OnyxEntry<OnyxTypes.ReportActions>, parentReportActionID: string | undefined): OnyxEntry<OnyxTypes.ReportAction> {
    if (!parentReportActions || !parentReportActionID) {
        return;
    }
    return parentReportActions[parentReportActionID];
}

/**
 * TODO
 * This component is under construction and not yet displayed to any users.
 */
function MoneyRequestReportView({report}: TemporaryMoneyRequestReportViewProps) {
    const styles = useThemeStyles();

    const reportID = report?.reportID;

    // const [accountManagerReportID] = useOnyx(ONYXKEYS.ACCOUNT_MANAGER_REPORT_ID);
    // const [accountManagerReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(accountManagerReportID)}`);
    // const [userLeavingStatus = false] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`);
    const [reportOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {allowStaleData: true});
    // const [reportNameValuePairsOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`, {allowStaleData: true});
    const [parentReportAction] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${getNonEmptyStringOnyxID(reportOnyx?.parentReportID)}`, {
        canEvict: false,
        selector: (parentReportActions) => getParentReportAction(parentReportActions, reportOnyx?.parentReportActionID),
    });

    const {reportActions, linkedAction, sortedAllReportActions, hasNewerActions, hasOlderActions} = usePaginatedReportActions(reportID);

    const mostRecentIOUReportActionID = useMemo(() => getMostRecentIOURequestActionID(reportActions), [reportActions]);

    const transactionThreadReportID = getOneTransactionThreadReportID(reportID, reportActions ?? [], false);
    const [transactionThreadReportActions] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID ?? CONST.DEFAULT_NUMBER_ID}`, {
        selector: (actions: OnyxEntry<OnyxTypes.ReportActions>) => getSortedReportActionsForDisplay(actions, canUserPerformWriteAction(report), true),
    });

    const [transactions = {}] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION);

    const isOffline = false;

    const [transactionThreadReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID ?? CONST.DEFAULT_NUMBER_ID}`);

    const actionsChatItem = reportActions.filter((ra) => {
        return ra.actionName !== 'IOU' && ra.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED;
    });

    // // Get a sorted array of reportActions for both the current report and the transaction thread report associated with this report (if there is one)
    // // so that we display transaction-level and report-level report actions in order in the one-transaction view
    // const reportActions2 = useMemo(
    //     () => (reportActionsToDisplay ? getCombinedReportActions(reportActionsToDisplay, transactionThreadReportID ?? null, transactionThreadReportActions ?? []) : []),
    //     [reportActionsToDisplay, transactionThreadReportActions, transactionThreadReportID],
    // );

    /* Thread's divider line should hide when the first chat in the thread is marked as unread.
     * This is so that it will not be conflicting with header's separator line.
     */
    // const shouldHideThreadDividerLine = useMemo(
    //     (): boolean => getFirstVisibleReportActionID(reportActions, isOffline) === unreadMarkerReportActionID,
    //     [reportActions, isOffline, unreadMarkerReportActionID],
    // );

    const parentReportActionForTransactionThread = useMemo(
        () =>
            isEmptyObject(transactionThreadReportActions)
                ? undefined
                : (reportActions?.find((action) => action.reportActionID === transactionThreadReport?.parentReportActionID) as OnyxEntry<OnyxTypes.ReportAction>),
        [reportActions, transactionThreadReportActions, transactionThreadReport?.parentReportActionID],
    );

    const canPerformWriteAction = canUserPerformWriteAction(report);
    const visibleReportActions = useMemo(() => {
        const filteredActions = actionsChatItem.filter(
            (reportAction) =>
                (isOffline || isDeletedParentAction(reportAction) || reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE || reportAction.errors) &&
                shouldReportActionBeVisible(reportAction, reportAction.reportActionID, canPerformWriteAction),
        );

        return [...filteredActions].toReversed();
    }, [actionsChatItem, isOffline, canPerformWriteAction]);

    const transactionList = Object.values(transactions).filter((transaction): transaction is Transaction => {
        return transaction?.reportID === reportID;
    });

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => (
            <ReportActionsListItemRenderer
                reportAction={reportAction}
                parentReportAction={parentReportAction}
                parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                index={index}
                report={report}
                transactionThreadReport={transactionThreadReport}
                displayAsGroup={
                    !isConsecutiveChronosAutomaticTimerAction(visibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID)) &&
                    isConsecutiveActionMadeByPreviousActor(visibleReportActions, index)
                }
                mostRecentIOUReportActionID={mostRecentIOUReportActionID}
                shouldHideThreadDividerLine
                shouldDisplayNewMarker={false}
                // shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                // shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                // shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                shouldDisplayReplyDivider={visibleReportActions.length > 1}
                isFirstVisibleReportAction={false}
            />
        ),
        [
            report,
            visibleReportActions,
            mostRecentIOUReportActionID,
            parentReportAction,
            transactionThreadReport,
            parentReportActionForTransactionThread,
            // unreadMarkerReportActionID,
            // shouldHideThreadDividerLine,
            // shouldUseThreadDividerLine,
            // firstVisibleReportActionID,
        ],
    );

    const listHeaderComponent = (
        <MoneyRequestReportTransactionList
            transactions={transactionList}
            report={report}
        />
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
                    // onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    // onStartReached={onStartReached}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={listHeaderComponent}
                    keyboardShouldPersistTaps="handled"
                    // onLayout={onLayoutInner}
                    // onContentSizeChange={onContentSizeChangeInner}
                    // onScroll={trackVerticalScrolling}
                    // onScrollToIndexFailed={onScrollToIndexFailed}
                    // extraData={extraData}
                    // key={listID}
                    // shouldEnableAutoScrollToTopThreshold={shouldEnableAutoScrollToTopThreshold}
                    // initialScrollKey={reportActionID}
                />
            ) : (
                <ReportActionsSkeletonView />
            )}
        </View>
    );
}

MoneyRequestReportView.displayName = 'MoneyRequestReportView';

export default MoneyRequestReportView;
