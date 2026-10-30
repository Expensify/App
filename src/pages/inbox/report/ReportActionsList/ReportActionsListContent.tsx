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
import useRetireMerchantRuleSuggestionOnLeave from '@hooks/useRetireMerchantRuleSuggestionOnLeave';
import useSidePanelState from '@hooks/useSidePanelState';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import Navigation from '@libs/Navigation/Navigation';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import {shouldHidePayAction} from '@libs/ReportActionsUtils';
import {isArchivedReport, shouldShowMarkAsDone} from '@libs/ReportUtils';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useActionListContext} from '@pages/inbox/ActionListContext';
import {useConciergeChatHistoryActions} from '@pages/inbox/ConciergeChatHistoryContext';
import AskConciergeWelcome from '@pages/inbox/report/AskConciergeWelcome';
import ConciergeChatHistoryToggle from '@pages/inbox/report/ConciergeChatHistoryToggle';
import FloatingMessageCounter from '@pages/inbox/report/FloatingMessageCounter';
import {useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import ReportActionsListHeader from '@pages/inbox/report/ReportActionsListHeader';
import ReportActionsListPaddingView from '@pages/inbox/report/ReportActionsListPaddingView';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import {LegendList} from '@legendapp/list/react-native';
import {useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useState} from 'react';
import {Platform, View} from 'react-native';

import type {ReportActionsListProps} from './types';

import useReportActionsListData from './useReportActionsListData';
import useReportActionsListRenderItem from './useReportActionsListRenderItem';
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
        sortedReportActions: unfilteredReportActions,
        sortedVisibleReportActions: unfilteredVisibleReportActions,
        isConciergeHiddenHistory,
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
    const linkedReportActionID = route?.params?.reportActionID;
    const {sessionStartTime} = useSidePanelState();
    const {collapseHistory: collapseConciergeHistory} = useConciergeChatHistoryActions();

    useLinkedMessageOfflineLoading({reportID: report?.reportID ?? reportID, reportActionIDFromRoute: linkedReportActionID});

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

    const {getScrollOffset} = useActionListContext();
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

    const reportActionsListData = useReportActionsListData({
        sortedVisibleReportActions,
        reportNameValuePairs,
        isOffline,
        sessionStartTime,
        linkedReportActionID,
        unreadMarkerReportActionID,
    });
    const {listData, reportActionIDToDisplayIndex, unreadMarkerListIndex, focusRequestedReportActionID, isDraftPendingCompletion} = reportActionsListData;

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

    const {renderItem, extraData} = useReportActionsListRenderItem({
        ...reportActionsListData,
        reportID,
        reportNameValuePairs,
        isReportArchived,
        isOffline,
        sortedReportActions,
        unreadMarkerReportActionID,
        linkedReportActionID,
        onShowPreviousMessages,
    });

    const latestActionsFooter = (
        <>
            {isConciergeHistoryExpanded && (
                <ConciergeChatHistoryToggle
                    isHistoryShown
                    onPress={() => {
                        collapseConciergeHistory();
                        if (linkedReportActionID) {
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
