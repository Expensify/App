import type {ListRenderItemInfo} from '@react-native/virtualized-lists';
import {useRoute} from '@react-navigation/native';
import {isUserValidatedSelector} from '@selectors/Account';
import {tierNameSelector} from '@selectors/UserWallet';
import React, {useContext, useEffect, useRef, useState} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlatList from '@components/FlatList/InvertedFlatList';
import {usePersonalDetails} from '@components/OnyxListItemProvider';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useCopySelectionHelper from '@hooks/useCopySelectionHelper';
import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useLoadReportActions from '@hooks/useLoadReportActions';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
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
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {generateNewRandomInt} from '@libs/NumberUtils';
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
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
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

let listOldID = Math.round(Math.random() * 100);

function keyExtractor(item: OnyxTypes.ReportAction): string {
    return item.reportActionID;
}

const onScrollToIndexFailed = () => {};

const selectNetworkOffline = (network: OnyxEntry<OnyxTypes.Network>) => ({isOffline: !!network?.isOffline});

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

    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const [networkState] = useOnyx(ONYXKEYS.NETWORK, {selector: selectNetworkOffline});
    const isOffline = !!networkState?.isOffline;

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
        isOffline: visibility.isOffline,
        hasOnceLoadedReportActions: !!reportMetadata?.hasOnceLoadedReportActions,
        onLayout,
    });

    // ─── listID — changes only for comment linking ───
    const prevReportActionID = useRef(linkedReportActionID);
    const [listID, setListID] = useState(listOldID);

    useEffect(() => {
        if (!linkedReportActionID && !prevReportActionID.current) {
            prevReportActionID.current = linkedReportActionID;
            return;
        }
        const newID = generateNewRandomInt(listOldID, 1, Number.MAX_SAFE_INTEGER);
        listOldID = newID;
        setListID(newID);
        prevReportActionID.current = linkedReportActionID;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [route, linkedReportActionID]);

    // ─── Linked message offline effect ───
    useEffect(() => {
        if (!linkedReportActionID || !isOffline) {
            return;
        }
        updateLoadingInitialReportAction(report?.reportID ?? reportID);
    }, [isOffline, report?.reportID, reportID, linkedReportActionID]);

    // ═══════════════════════════════════════════════════════
    // ═══ renderItem passthrough hooks (tech debt) ═══
    // ═══════════════════════════════════════════════════════
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
    // ═══════════════════════════════════════════════════════
    // ═══ end renderItem passthrough ═══
    // ═══════════════════════════════════════════════════════

    // ─── Derived values for renderItem ───
    const shouldHideThreadDividerLine = getFirstVisibleReportActionID(pagination.reportActions, visibility.isOffline) === unreadMarkerReportActionID;
    const firstVisibleReportActionID = getFirstVisibleReportActionID(pagination.reportActions, visibility.isOffline);

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

    // ─── initialNumToRender ───
    const minimumReportActionHeight = styles.chatItem.paddingTop + styles.chatItem.paddingBottom + variables.fontSizeNormalHeight;
    const availableHeight = windowHeight - (CONST.CHAT_FOOTER_MIN_HEIGHT + variables.contentHeaderHeight);
    const numToRender = Math.ceil(availableHeight / minimumReportActionHeight);

    let initialNumToRender: number | undefined;
    if (shouldScrollToEndAfterLayout && (!pagination.shouldAddCreatedAction || visibility.isOffline)) {
        initialNumToRender = sortedVisibleReportActions.length;
    } else if (linkedReportActionID) {
        initialNumToRender = getInitialNumToRender(numToRender);
    } else {
        initialNumToRender = numToRender || undefined;
    }

    // ─── Skeletons ───
    const isLoadingInitialReportActions = reportMetadata?.isLoadingInitialReportActions;
    const isMissingReportActions = sortedVisibleReportActions.length === 0;

    const shouldShowSkeleton = isLoadingInitialReportActions && isMissingReportActions && !visibility.isOffline;

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

    // ─── Fullstory ───
    const reportActionsListFSClass = FS.getChatFSClass(report);
    const topReportAction = sortedVisibleReportActions.at(-1);

    // ─── Offline footer skeleton ───
    const shouldShowOfflineSkeleton = visibility.isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    // ─── extraData for native re-render ───
    const extraData = [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined];

    // ─── renderItem ───
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
                        !isConsecutiveChronosAutomaticTimerAction(sortedVisibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID), visibility.isOffline) &&
                        isConsecutiveActionMadeByPreviousActor(sortedVisibleReportActions, index, visibility.isOffline)
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

    // ─── renderTopReportActions (for shouldScrollToEndAfterLayout) ───
    const renderTopReportActions = () => {
        const previewItems = sortedVisibleReportActions.slice(initialNumToRender ? -initialNumToRender : 0).reverse();
        return (
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
        );
    };

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
                {shouldScrollToEndAfterLayout && topReportAction ? renderTopReportActions() : undefined}
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
                    onScrollToIndexFailed={onScrollToIndexFailed}
                    extraData={extraData}
                    key={listID}
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
