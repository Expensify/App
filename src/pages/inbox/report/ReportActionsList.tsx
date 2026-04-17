import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import type {FlashListRef, ListRenderItemInfo} from '@shopify/flash-list';
import React, {useContext, useEffect, useRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlashList from '@components/FlashList/InvertedFlashList';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePendingConciergeResponse from '@hooks/usePendingConciergeResponse';
import useReportActionsPagination from '@hooks/useReportActionsPagination';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useReportActionsVisibility from '@hooks/useReportActionsVisibility';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';
import {updateLoadingInitialReportAction} from '@libs/actions/Report';
import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import FS from '@libs/Fullstory';
import {
    getFirstVisibleReportActionID,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isReversedTransaction,
    isSentMoneyReportAction,
    isTransactionThread,
} from '@libs/ReportActionsUtils';
import {
    canShowReportRecipientLocalTime,
    canUserPerformWriteAction,
    chatIncludesChronosWithID,
    getOriginalReportID,
    isCanceledTaskReport,
    isExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isMoneyRequestReport,
    isTaskReport,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import FloatingMessageCounter from './FloatingMessageCounter';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';

type ReportActionsListProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    /** Callback executed on layout */
    onLayout?: (event: LayoutChangeEvent) => void;
};

function keyExtractor(item: OnyxTypes.ReportAction): string {
    return item.reportActionID;
}

function ReportActionsList({reportID, onLayout}: ReportActionsListProps) {
    // ─── Side effects ───
    useCopySelectionHelper();
    usePendingConciergeResponse(reportID);
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();

    // ─── Core data ───
    const [report] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`);
    const [reportMetadata] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`);
    const parentReportAction = useParentReportAction(report);
    const isReportArchived = useReportIsArchived(reportID);
    const canPerformWriteAction = canUserPerformWriteAction(report, isReportArchived);

    const {isOffline} = useNetwork();

    // ─── Pipeline: pagination → load → visibility ───
    const pagination = useReportActionsPagination(reportID);

    const {loadOlderChats, loadNewerChats} = useLoadReportActions({
        reportID,
        reportActions: pagination.reportActions,
        allReportActionIDs: pagination.allReportActionIDs,
        transactionThreadReportID: pagination.transactionThreadReport?.reportID,
        hasOlderActions: pagination.hasOlderActions,
        hasNewerActions: pagination.hasNewerActions,
    });

    const {
        visibleReportActions: sortedVisibleReportActions,
        hasPreviousMessages,
        showFullHistory,
        handleShowPreviousMessages,
    } = useReportActionsVisibility({
        reportID,
        reportActions: pagination.reportActions,
        canPerformWriteAction: !!canPerformWriteAction,
        hasOlderActions: pagination.hasOlderActions,
        loadOlderChats,
    });

    // ─── Unread marker + mark-as-read ───
    const {scrollOffsetRef, registerListRef} = useContext(ActionListContext);

    // Own the list ref locally; publish to context so scroll handlers (useReportScrollManager)
    // and ReportActionItemMessageEdit's Safari hack can reach the instance via `getListRef()`.
    // Keeping the ref local lets React Compiler compile this component — a ref in context would
    // trigger `react-hooks/refs` when passed to JSX `ref={}`.
    const listRef = useRef<FlashListRef<OnyxTypes.ReportAction> | null>(null);
    useEffect(() => {
        registerListRef(listRef);
        return () => registerListRef(null);
    }, [registerListRef]);

    const {unreadMarkerReportActionID, unreadMarkerReportActionIndex} = useUnreadMarker({
        reportID,
        sortedVisibleReportActions,
        sortedReportActions: pagination.reportActions,
        scrollingVerticalOffset: scrollOffsetRef,
    });

    const {readActionSkippedRef} = useMarkAsRead({
        reportID,
        sortedVisibleReportActions,
        transactionThreadReport: pagination.transactionThreadReport,
        scrollingVerticalOffset: scrollOffsetRef,
    });

    // ─── Scroll state ───
    const isTransactionThreadReport = isTransactionThread(parentReportAction) && !isSentMoneyReportAction(parentReportAction);
    const isMoneyRequestOrInvoiceReport = isMoneyRequestReport(report) || isInvoiceReport(report);
    const shouldFocusToTopOnMount = isTransactionThreadReport || isMoneyRequestOrInvoiceReport;

    const linkedReportActionID = pagination.reportActionID;

    const {
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        scrollToBottomAndMarkReportAsRead,
        onStartReached,
        onEndReached,
        onLayoutInner,
        retryLoadNewerChatsError,
        actionIdToHighlight,
    } = useReportActionsScroll({
        reportID,
        report,
        sortedVisibleReportActions,
        readActionSkippedRef,
        unreadMarkerReportActionIndex,
        loadOlderChats,
        loadNewerChats,
        linkedReportActionID,
        hasOnceLoadedReportActions: !!reportMetadata?.hasOnceLoadedReportActions,
        onLayout,
    });

    // ─── Linked message offline effect ───
    useEffect(() => {
        if (!linkedReportActionID || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, linkedReportActionID]);

    // ─── START renderItem deps (can't be inside renderItem yet before list-item-level useOnyx is allowed — hooks must be at top level) ───
    const personalDetailsList = usePersonalDetails();
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [reportActionsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);

    const firstVisibleReportActionID = getFirstVisibleReportActionID(pagination.reportActions, isOffline);
    const shouldHideThreadDividerLine = firstVisibleReportActionID === unreadMarkerReportActionID;

    let shouldUseThreadDividerLine = false;
    const topReport = sortedVisibleReportActions.length > 0 ? sortedVisibleReportActions.at(sortedVisibleReportActions.length - 1) : null;

    if (topReport && topReport.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
        shouldUseThreadDividerLine = false;
    } else if (isTransactionThread(parentReportAction)) {
        shouldUseThreadDividerLine = !isDeletedParentAction(parentReportAction) && !isReversedTransaction(parentReportAction);
    } else if (isTaskReport(report)) {
        shouldUseThreadDividerLine = !isCanceledTaskReport(report, parentReportAction);
    } else {
        shouldUseThreadDividerLine = isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    }

    const isWriteActionDisabled = !canUserPerformWriteAction(report, isReportArchived);
    const shouldShowReportRecipientLocalTime = canShowReportRecipientLocalTime(personalDetailsList, report, currentUserAccountID);
    // ─── END renderItem deps ───

    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;
    const isMissingReportActions = sortedVisibleReportActions.length === 0;

    const shouldShowSkeleton = isLoadingInitialReportActions && isMissingReportActions && !isOffline;

    useEffect(() => {
        if (!shouldShowSkeleton || !report) {
            return;
        }
        markOpenReportEnd(report, {warm: false});
    }, [report, shouldShowSkeleton]);

    if (shouldShowSkeleton) {
        return <ReportActionsSkeletonView />;
    }

    const reportActionsListFSClass = FS.getChatFSClass(report);

    const shouldShowOfflineSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const extraData = shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined;

    const renderItem = ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
        const originalReportID = getOriginalReportID(reportID, reportAction, reportActionsFromOnyx);

        return (
            <>
                <ShowPreviousMessagesButton
                    reportAction={reportAction}
                    hasPreviousMessages={hasPreviousMessages}
                    showFullHistory={showFullHistory}
                    onPress={handleShowPreviousMessages}
                />
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={pagination.parentReportActionForTransactionThread}
                    index={index}
                    report={report}
                    transactionThreadReport={pagination.transactionThreadReport}
                    linkedReportActionID={linkedReportActionID}
                    displayAsGroup={
                        !isConsecutiveChronosAutomaticTimerAction(sortedVisibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                        isConsecutiveActionMadeByPreviousActor(sortedVisibleReportActions, index, isOffline)
                    }
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                    shouldDisplayReplyDivider={sortedVisibleReportActions.length > 1}
                    isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                    shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                    shouldHighlight={reportAction.reportActionID === actionIdToHighlight}
                    userWalletTierName={userWalletTierName}
                    isUserValidated={isUserValidated}
                    personalDetails={personalDetailsList}
                    originalReportID={originalReportID}
                    isReportArchived={isReportArchived}
                    userBillingFundID={userBillingFundID}
                    isTryNewDotNVPDismissed={isTryNewDotNVPDismissed}
                    reportNameValuePairsOrigin={reportNameValuePairs?.origin}
                    reportNameValuePairsOriginalID={reportNameValuePairs?.originalID}
                />
            </>
        );
    };

    return (
        <>
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
            />
            <View
                style={[styles.flex1, !shouldShowReportRecipientLocalTime && !isWriteActionDisabled ? styles.pb4 : {}]}
                fsClass={reportActionsListFSClass}
            >
                <InvertedFlashList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={listRef}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={sortedVisibleReportActions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    drawDistance={1500}
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={[styles.chatContentScrollView, shouldFocusToTopOnMount && styles.justifyContentEnd]}
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={onStartReached}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={
                        <ReportActionsListHeader
                            reportID={reportID}
                            onRetry={retryLoadNewerChatsError}
                        />
                    }
                    ListFooterComponent={shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : null}
                    keyboardShouldPersistTaps="handled"
                    onLayout={onLayoutInner}
                    onScroll={trackVerticalScrolling}
                    onViewableItemsChanged={onViewableItemsChanged}
                    extraData={extraData}
                    key={reportID}
                    getItemType={(item) => item.actionName}
                    initialScrollKey={linkedReportActionID}
                    maintainVisibleContentPosition={shouldFocusToTopOnMount && !linkedReportActionID ? {startRenderingFromBottom: true} : undefined}
                    onContentSizeChange={() => {
                        trackVerticalScrolling(undefined);
                    }}
                />
            </View>
        </>
    );
}

export default ReportActionsList;
