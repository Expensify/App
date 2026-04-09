import type {ListRenderItemInfo} from '@react-native/virtualized-lists';
import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import React, {useContext, useEffect, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlatList from '@components/FlatList/InvertedFlatList';
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
import useWindowDimensions from '@hooks/useWindowDimensions';
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
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import FloatingMessageCounter from './FloatingMessageCounter';
import getInitialNumToRender from './getInitialNumReportActionsToRender';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';
import StaticReportActionsPreview from './StaticReportActionsPreview';

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

    const visibility = useReportActionsVisibility(reportID, pagination.reportActions, !!canPerformWriteAction, pagination.hasOlderActions, loadOlderChats);

    const sortedVisibleReportActions = visibility.visibleReportActions;

    // ─── Unread marker + mark-as-read ───
    const {scrollOffsetRef} = useContext(ActionListContext);

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

    // "Mount scrolled to end" workaround for transaction threads and money request reports.
    // RN's FlatList has no native way to mount an inverted list at the end with variable-height items:
    //
    // - initialScrollIndex: broken on inverted lists, open as of RN 0.84
    //   https://github.com/facebook/react-native/issues/56237
    //   https://github.com/facebook/react-native/issues/54409
    //   https://github.com/facebook/react-native/issues/41163
    // - contentOffset: requires knowing content height before layout
    // - getItemLayout with approximation: disables native cell measurement permanently, corrupts virtualization
    //
    // The workaround: render all items in a hidden list (flex0 + shouldHideContent), call scrollToEnd after
    // layout, then reveal. StaticReportActionsPreview shows a placeholder during this process.
    const [shouldScrollToEndAfterLayout, setShouldScrollToEndAfterLayout] = useState(shouldFocusToTopOnMount && !linkedReportActionID);

    const scroll = useReportActionsScroll({
        reportID,
        report,
        sortedVisibleReportActions,
        readActionSkippedRef,
        unreadMarkerReportActionIndex,
        loadOlderChats,
        loadNewerChats,
        shouldAddCreatedAction: pagination.shouldAddCreatedAction,
        linkedReportActionID,
        shouldScrollToEndAfterLayout,
        setShouldScrollToEndAfterLayout,
        shouldFocusToTopOnMount,
        isOffline,
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
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const [userWalletTierName] = useOnyx(ONYXKEYS.USER_WALLET, {selector: tierNameSelector});
    const [isUserValidated] = useOnyx(ONYXKEYS.ACCOUNT, {selector: isUserValidatedSelector});
    const [reportActionsFromOnyx] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`);
    const [userBillingFundID] = useOnyx(ONYXKEYS.NVP_BILLING_FUND_ID);
    const [tryNewDot] = useOnyx(ONYXKEYS.NVP_TRY_NEW_DOT);
    const isTryNewDotNVPDismissed = !!tryNewDot?.classicRedirect?.dismissed;
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);

    const shouldHideThreadDividerLine = getFirstVisibleReportActionID(pagination.reportActions, isOffline) === unreadMarkerReportActionID;
    const firstVisibleReportActionID = getFirstVisibleReportActionID(pagination.reportActions, isOffline);

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

    const hideComposer = !canUserPerformWriteAction(report, isReportArchived);
    const shouldShowReportRecipientLocalTime = canShowReportRecipientLocalTime(personalDetailsList, report, currentUserAccountID);
    // ─── END renderItem deps ───

    // ─── initialNumToRender ───
    const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom + variables.fontSizeNormalHeight;
    const availableHeight = windowHeight - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
    const numToRender = Math.ceil(availableHeight / minimumReportActionHeight);

    let initialNumToRender: number | undefined;
    if (shouldScrollToEndAfterLayout && (!pagination.shouldAddCreatedAction || isOffline)) {
        // Render ALL items so scrollToEnd() lands at the correct position (see shouldScrollToEndAfterLayout comment above).
        initialNumToRender = sortedVisibleReportActions.length;
    } else if (linkedReportActionID) {
        // Web needs at least 50 to prevent excessive onStartReached triggers (see getInitialNumToRender).
        initialNumToRender = getInitialNumToRender(numToRender);
    } else {
        initialNumToRender = numToRender || undefined;
    }

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

    const hasDerivedValueTimingIssue = pagination.reportActions.length > 0 && isMissingReportActions;
    if (hasDerivedValueTimingIssue && !visibility.showConciergeSidePanelWelcome) {
        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }

    const reportActionsListFSClass = FS.getChatFSClass(report);
    const topReportAction = sortedVisibleReportActions.at(-1);

    const shouldShowOfflineSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const extraData = [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined];

    const renderItem = ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
        const originalReportID = getOriginalReportID(reportID, reportAction, reportActionsFromOnyx);

        return (
            <>
                <ShowPreviousMessagesButton
                    reportAction={reportAction}
                    hasPreviousMessages={visibility.hasPreviousMessages}
                    showFullHistory={visibility.showFullHistory}
                    onPress={visibility.handleShowPreviousMessages}
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
                    shouldHighlight={reportAction.reportActionID === scroll.actionIdToHighlight}
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

    const previewItems = sortedVisibleReportActions.slice(initialNumToRender ? -initialNumToRender : 0).reverse();

    return (
        <>
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={scroll.isFloatingMessageCounterVisible}
                onClick={scroll.scrollToBottomAndMarkReportAsRead}
            />
            <View
                style={[styles.flex1, !shouldShowReportRecipientLocalTime && !hideComposer ? styles.pb4 : {}]}
                fsClass={reportActionsListFSClass}
            >
                {shouldScrollToEndAfterLayout && !!topReportAction && (
                    <>
                        {!shouldShowReportRecipientLocalTime && !hideComposer && <View style={[styles.stickToBottom, styles.appBG, styles.zIndex10, styles.height4]} />}
                        <StaticReportActionsPreview>
                            {previewItems.map((action) => {
                                const actionIndex = sortedVisibleReportActions.indexOf(action);
                                return (
                                    <View key={action.reportActionID}>
                                        {renderItem({
                                            item: action,
                                            index: actionIndex,
                                        } as ListRenderItemInfo<OnyxTypes.ReportAction>)}
                                    </View>
                                );
                            })}
                        </StaticReportActionsPreview>
                    </>
                )}
                <InvertedFlatList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={scroll.reportScrollManager.ref}
                    testID="report-actions-list"
                    style={[styles.overscrollBehaviorContain, shouldScrollToEndAfterLayout && styles.flex0]}
                    data={sortedVisibleReportActions}
                    renderItem={renderItem}
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={[styles.chatContentScrollView, shouldFocusToTopOnMount ? styles.justifyContentEnd : undefined]}
                    shouldHideContent={shouldScrollToEndAfterLayout}
                    shouldDisableVisibleContentPosition={shouldScrollToEndAfterLayout}
                    showsVerticalScrollIndicator={!shouldScrollToEndAfterLayout}
                    keyExtractor={keyExtractor}
                    initialNumToRender={initialNumToRender}
                    onEndReached={scroll.onEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={scroll.onStartReached}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={
                        <ReportActionsListHeader
                            reportID={reportID}
                            onRetry={scroll.retryLoadNewerChatsError}
                        />
                    }
                    ListFooterComponent={shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : null}
                    keyboardShouldPersistTaps="handled"
                    onLayout={scroll.onLayoutInner}
                    onScroll={scroll.trackVerticalScrolling}
                    onViewableItemsChanged={scroll.onViewableItemsChanged}
                    extraData={extraData}
                    // changes only for comment linking
                    key={linkedReportActionID ? `${reportID}-${linkedReportActionID}` : reportID}
                    shouldEnableAutoScrollToTopThreshold
                    initialScrollKey={linkedReportActionID}
                    onContentSizeChange={() => {
                        scroll.trackVerticalScrolling(undefined);
                    }}
                />
            </View>
        </>
    );
}

export default ReportActionsList;
