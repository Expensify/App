/** Renders report messages with history controls, unread indicators, and loading states. */
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import MerchantRuleSuggestionBanner from '@components/MerchantRuleSuggestionBanner';
import {ReportActionsAnimatedSkeletonCover} from '@components/ReportActionsSkeletonCover';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useEnvironment from '@hooks/useEnvironment';
import useLinkedMessageOfflineLoading from '@hooks/useLinkedMessageOfflineLoading';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import {usePersonalDetailsByIDs} from '@hooks/usePersonalDetails';
import useReportsParentHierarchy from '@hooks/useReportsParentHierarchy';
import useRetireMerchantRuleSuggestionOnLeave from '@hooks/useRetireMerchantRuleSuggestionOnLeave';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {
    getFirstVisibleReportActionID,
    getFeedbackPromptActionIDs,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isReversedTransaction,
    isTransactionThread,
    shouldHidePayAction,
} from '@libs/ReportActionsUtils';
import {
    chatIncludesChronosWithID,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isCanceledTaskReport,
    isExpenseReport,
    isHarvestCreatedExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isTaskReport,
    isSupportTicket,
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useActionListContext} from '@pages/inbox/ActionListContext';
import {useConciergeChatHistoryActions} from '@pages/inbox/ConciergeChatHistoryContext';
import AskConciergeWelcome from '@pages/inbox/report/AskConciergeWelcome';
import CollapsedSystemMessages from '@pages/inbox/report/CollapsedSystemMessages';
import ConciergeChatHistoryToggle from '@pages/inbox/report/ConciergeChatHistoryToggle';
import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';
import {ReportActionPositionContextProvider} from '@pages/inbox/report/ReportActionIndexContext';
import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import ReportActionsListHeader from '@pages/inbox/report/ReportActionsListHeader';
import ReportActionsListItemRenderer from '@pages/inbox/report/ReportActionsListItemRenderer';
import ReportActionsListPaddingView from '@pages/inbox/report/ReportActionsListPaddingView';
import ShowPreviousMessagesButton from '@pages/inbox/report/ShowPreviousMessagesButton';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import getEmptyArray from '@src/types/utils/getEmptyArray';

import type {LegendListRenderItemProps} from '@legendapp/list/react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {LegendList} from '@legendapp/list/react-native';
import {useRoute} from '@react-navigation/native';
import {getCustomAgentAccountIDs} from '@selectors/AgentZeroChat';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import {accountIDSelector} from '@selectors/Session';
import React, {useState} from 'react';
import {Platform, View} from 'react-native';

import type {ReportActionsListProps} from './types';

import useReportActionsListData from './useReportActionsListData';
import useReportActionsListScroll from './useReportActionsListScroll';
import useReportActionsListTelemetry from './useReportActionsListTelemetry';

const REPORT_ACTIONS_DRAW_DISTANCE = 1500;

function ReportActionsListContent({reportID, conciergeChat, onLayout}: ReportActionsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();

    const {
        report,
        hasOnceLoadedReportActions,
        hasNewerActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        parentReportAction,
        sortedReportActions: unfilteredReportActions,
        sortedVisibleReportActions: unfilteredVisibleReportActions,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
        persistedReportActionIDs,
        shouldShowConciergeWelcome,
        isConciergeHistoryExpanded,
    } = useReportActionsListState();

    // Remove rows hidden by the renderer before calculating summary counts, headers, and scroll positions.
    const sortedReportActions = report?.isWaitingOnBankAccount ? unfilteredReportActions.filter((action) => !shouldHidePayAction(action, true)) : unfilteredReportActions;
    const sortedVisibleReportActions = report?.isWaitingOnBankAccount
        ? unfilteredVisibleReportActions.filter((action) => !shouldHidePayAction(action, true))
        : unfilteredVisibleReportActions;

    const {isOffline} = useNetwork();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const {sessionStartTime} = useSidePanelState();
    const {collapseHistory: collapseConciergeHistory} = useConciergeChatHistoryActions();

    useLinkedMessageOfflineLoading({reportID: report?.reportID ?? reportID, reportActionIDFromRoute});

    // Owned here rather than by the callout, which unmounts as the layout and composer change size.
    useRetireMerchantRuleSuggestionOnLeave(reportID);

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const isReportArchived = !!isArchivedReport(reportNameValuePairs);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    const reportAttributesSelector = (value: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => {
        const attrs = value?.reports?.[reportID];
        if (!attrs) {
            return undefined;
        }
        return {
            actionBadge: attrs.actionBadge,
            actionTargetReportActionID: attrs.actionTargetReportActionID,
            brickRoadStatus: attrs.brickRoadStatus,
        };
    };
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesSelector,
    });
    const isHarvestCreatedExpenseReportAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {selector: getStableReportSelector});
    const [chatReportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${getNonEmptyStringOnyxID(reportStable?.chatReportID)}`, {selector: getStableReportSelector});
    const reportsParentHierarchy = useReportsParentHierarchy(reportID);

    const linkedReportActionID = reportActionIDFromRoute;

    const {getScrollOffset} = useActionListContext();

    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(() => getScrollOffset() >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
    const {unreadMarkerReportActionID} = useUnreadMarker({
        reportID,
        sortedVisibleReportActions,
        sortedReportActions,
        oldestUnreadReportActionID: oldestUnreadReportAction?.reportActionID,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!hasOnceLoadedReportActions,
        newMessageBoundaryTime: isConciergeHiddenHistory ? sessionStartTime : undefined,
    });

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID,
        report,
        transactionThreadReport,
        sortedVisibleReportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
    });

    const {
        renderedVisibleReportActions,
        reportActionsToRender,
        listData,
        canonicalIndexByReportActionID,
        runsByAnchorReportActionID,
        reportActionIDToDisplayIndex,
        expandedSystemMessageReportActionIDs,
        unreadMarkerListIndex,
        expandSystemMessageRun,
        focusRequestedReportActionID,
        onExpandedSystemMessageReady,
        draftMessageHTML,
        draftReportActionID,
        isDraftPendingCompletion,
    } = useReportActionsListData({
        sortedVisibleReportActions,
        reportNameValuePairs,
        isOffline,
        sessionStartTime,
        linkedReportActionID,
        unreadMarkerReportActionID,
    });

    const {
        listID,
        legendListProps,
        loadedInitialViewportListID,
        shouldShowInitialViewportSkeleton,
        shouldBeAlignedToTop,
        onShowPreviousMessages,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
    } = useReportActionsListScroll({
        reportID,
        conciergeChat,
        sortedVisibleReportActions,
        renderedVisibleReportActions: listData,
        reportActionIDToDisplayIndex,
        markNewestActionAsRead,
        completeSkippedMarkAsRead,
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex: unreadMarkerListIndex,
        focusRequestedReportActionID,
        actionBadgeTargetID: reportAttributes?.actionTargetReportActionID,
        isOffline,
        linkedReportActionID,
        onScrolledOverThresholdChange: setHasScrolledOverThreshold,
        onLayout,
    });

    useReportActionsListTelemetry({reportID, listID, loadedInitialViewportListID, shouldShowInitialViewportSkeleton});

    const firstVisibleReportActionID = getFirstVisibleReportActionID(sortedReportActions, isOffline);

    const [currentUserAccountID] = useOnyx(ONYXKEYS.SESSION, {selector: accountIDSelector});

    // An agent account can be opened through Copilot, and the agent must not rate its own replies
    const actorAccountIDs = [...new Set(renderedVisibleReportActions.map((action) => action.actorAccountID))].filter((accountID) => accountID !== currentUserAccountID);
    const [customAgentAccountIDs = getEmptyArray<number>()] = usePersonalDetailsByIDs(actorAccountIDs, getCustomAgentAccountIDs);

    // Skip inside the thread the backend opens after a thumbs down, while a Concierge answer is still streaming, and while newer actions are not loaded because the newest reply may not be in the list yet
    const latestConciergeFeedbackActionIDs =
        reportNameValuePairs?.conciergeFeedbackForReportActionID || isDraftPendingCompletion || hasNewerActions
            ? getEmptyArray<string>()
            : getFeedbackPromptActionIDs(renderedVisibleReportActions, persistedReportActionIDs, customAgentAccountIDs);

    /**
     * Thread's divider line should hide when the first chat in the thread is marked as unread.
     * This is so that it will not be conflicting with header's separator line.
     */
    const shouldHideThreadDividerLine = firstVisibleReportActionID === unreadMarkerReportActionID;

    const shouldUseThreadDividerLine = (() => {
        const topReport = renderedVisibleReportActions.length > 0 ? renderedVisibleReportActions.at(renderedVisibleReportActions.length - 1) : null;

        if (topReport && topReport.actionName !== CONST.REPORT.ACTIONS.TYPE.CREATED) {
            return false;
        }

        if (isTransactionThread(parentReportAction)) {
            return !isDeletedParentAction(parentReportAction) && !isReversedTransaction(parentReportAction);
        }

        if (isTaskReport(report)) {
            return !isCanceledTaskReport(report, parentReportAction);
        }

        if (isSupportTicket(report)) {
            return true;
        }

        return isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    })();

    const renderItem = ({item: reportAction, index}: LegendListRenderItemProps<OnyxTypes.ReportAction>) => {
        const canonicalIndex = canonicalIndexByReportActionID.get(reportAction.reportActionID) ?? index;
        const systemMessageRun = runsByAnchorReportActionID.get(reportAction.reportActionID);
        const previousReportAction = index > 0 ? listData.at(index - 1) : undefined;
        const previousRun = previousReportAction ? runsByAnchorReportActionID.get(previousReportAction.reportActionID) : undefined;
        const isAfterCollapsedRun = !!previousRun && !previousRun.isExpanded;
        const shouldDisableContextMenuForConciergeDraft = isDraftPendingCompletion && draftReportActionID === reportAction.reportActionID;

        return (
            <ReportActionPositionContextProvider
                index={index}
                isNewest={index === listData.length - 1}
                isRecycling
            >
                {systemMessageRun && !systemMessageRun.isExpanded ? (
                    <CollapsedSystemMessages
                        count={systemMessageRun.reportActionIDs.length}
                        earliestReportAction={systemMessageRun.earliestReportAction}
                        report={reportStable}
                        onPress={() => expandSystemMessageRun(systemMessageRun.reportActionIDs)}
                        unreadMarkerReportActionID={
                            unreadMarkerReportActionID &&
                            systemMessageRun.reportActionIDs.includes(unreadMarkerReportActionID) &&
                            (!shouldUseThreadDividerLine || !shouldHideThreadDividerLine)
                                ? unreadMarkerReportActionID
                                : undefined
                        }
                    />
                ) : (
                    <ReportActionsListItemRenderer
                        reportAction={reportAction}
                        parentReportAction={parentReportAction}
                        parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                        report={reportStable}
                        transactionThreadReport={transactionThreadReport}
                        chatReport={chatReportStable}
                        linkedReportActionID={linkedReportActionID}
                        displayAsGroup={
                            !isAfterCollapsedRun &&
                            !isConsecutiveChronosAutomaticTimerAction(reportActionsToRender, canonicalIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                            isConsecutiveActionMadeByPreviousActor(reportActionsToRender, canonicalIndex, isOffline)
                        }
                        shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                        shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                        shouldDisplayReplyDivider={reportActionsToRender.length > 1}
                        isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                        isLatestConciergeFeedbackAction={latestConciergeFeedbackActionIDs.includes(reportAction.reportActionID)}
                        reportsParentHierarchy={reportsParentHierarchy}
                        onExpandedSystemMessageReady={
                            reportAction.reportActionID === focusRequestedReportActionID ? (target) => onExpandedSystemMessageReady(reportAction.reportActionID, target) : undefined
                        }
                        shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                        isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReportAction}
                        shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
                    />
                )}
                {!!reportStable?.reportID && (
                    <ShowPreviousMessagesButton
                        reportID={reportStable.reportID}
                        actionType={reportAction.actionName}
                        hasPreviousMessages={!!hasPreviousMessages}
                        showFullHistory={!showHiddenHistory}
                        onPress={onShowPreviousMessages}
                    />
                )}
            </ReportActionPositionContextProvider>
        );
    };

    // Ensure row presentation updates when these values change without changing the action data.
    const extraData = [
        unreadMarkerReportActionID,
        isArchivedNonExpenseReport(report, isReportArchived),
        draftReportActionID,
        draftMessageHTML,
        isDraftPendingCompletion,
        latestConciergeFeedbackActionIDs,
        expandedSystemMessageReportActionIDs,
        focusRequestedReportActionID,
    ];

    const latestActionsFooter = (
        <>
            {isConciergeHistoryExpanded && (
                <ConciergeChatHistoryToggle
                    isHistoryShown
                    onPress={() => {
                        collapseConciergeHistory();
                        if (reportActionIDFromRoute) {
                            Navigation.setParams({reportActionID: ''}, route.key);
                        }
                    }}
                />
            )}
            <ReportActionsListHeader
                reportID={reportID}
                isDraftPendingCompletion={isDraftPendingCompletion}
            />
        </>
    );

    const shouldShowOfflineSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const offlineHistoryHeader = shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : undefined;

    const shouldShowMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
        rules,
    });

    // The guard only mounts this content when the report is loaded, so this is effectively unreachable.
    // It narrows `report` to non-undefined for the render below and stays a safe fallback if the report
    // is cleared mid-session while the latch keeps the content mounted.
    if (!report) {
        return <ReportActionsAnimatedSkeletonCover />;
    }

    if (shouldShowConciergeWelcome) {
        return (
            <AskConciergeWelcome
                reportID={reportID}
                onShowPreviousMessages={onShowPreviousMessages}
            />
        );
    }

    return (
        <>
            {/* Pinned over the top of the list rather than laid out inside it, so scrolling the expense detail view
                does not carry it out of sight. Renders nothing on the layouts the composer mount serves. */}
            <MerchantRuleSuggestionBanner
                reportID={reportID}
                policyID={report?.policyID}
                containerStyles={[styles.mh4, styles.mt2]}
                overlayStyles={styles.merchantRuleCalloutOverlay}
            />
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
                actionBadge={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.actionBadge : undefined}
                actionBadgeBrickRoadStatus={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.brickRoadStatus : undefined}
                onActionBadgePress={scrollToActionBadgeTarget}
                shouldShowMarkAsDoneCopy={shouldShowMarkAsDoneCopy}
            />
            <ReportActionsListPaddingView
                report={report}
                isReportArchived={isReportArchived}
            >
                <LegendList
                    {...legendListProps}
                    accessibilityLabel={Platform.OS === 'web' ? undefined : translate('sidebarScreen.listOfChatMessages')}
                    aria-label={Platform.OS === 'web' ? translate('sidebarScreen.listOfChatMessages') : undefined}
                    data-testid={Platform.OS === 'web' ? 'report-actions-list' : undefined}
                    testID={Platform.OS === 'web' ? undefined : 'report-actions-list'}
                    style={[styles.flex1, styles.overscrollBehaviorContain]}
                    data={listData}
                    renderItem={renderItem}
                    drawDistance={REPORT_ACTIONS_DRAW_DISTANCE}
                    recycleItems
                    experimental_hideItemsUntilMeasured
                    renderScrollComponent={Platform.OS === 'web' ? undefined : renderActionSheetAwareScrollView}
                    scrollEventThrottle={16}
                    contentContainerStyle={[styles.chatContentScrollView, styles.pb0]}
                    ListHeaderComponent={offlineHistoryHeader}
                    ListFooterComponent={latestActionsFooter}
                    ListFooterComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    keyboardShouldPersistTaps="handled"
                    extraData={extraData}
                    key={listID}
                    // Keep the existing pixel-based new-message policy in useReportActionsScroll.
                    maintainScrollAtEnd={false}
                    maintainVisibleContentPosition
                />
                {shouldShowInitialViewportSkeleton && (
                    <View
                        pointerEvents="none"
                        style={[styles.pAbsolute, styles.t0, styles.r0, styles.b0, styles.l0, styles.zIndex10]}
                    >
                        <ReportActionsAnimatedSkeletonCover />
                    </View>
                )}
            </ReportActionsListPaddingView>
        </>
    );
}

export default ReportActionsListContent;
