import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlashList from '@components/FlashList/InvertedFlashList';
import MerchantRuleSuggestionBanner from '@components/MerchantRuleSuggestionBanner';
import {ReportActionsAnimatedSkeletonCover} from '@components/ReportActionsSkeletonCover';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useEnvironment from '@hooks/useEnvironment';
import useLinkedMessageOfflineLoading from '@hooks/useLinkedMessageOfflineLoading';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useRetireMerchantRuleSuggestionOnLeave from '@hooks/useRetireMerchantRuleSuggestionOnLeave';
import useThemeStyles from '@hooks/useThemeStyles';

import moveAccessibilityFocus from '@libs/Accessibility/moveAccessibilityFocus';

import AskConciergeWelcome from '@pages/inbox/report/AskConciergeWelcome';
import ConciergeChatHistoryToggle from '@pages/inbox/report/ConciergeChatHistoryToggle';
import {useReportActionsListActions, useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import ReportActionsListHeader from '@pages/inbox/report/ReportActionsListHeader';
import ReportActionsListPaddingView from '@pages/inbox/report/ReportActionsListPaddingView';

import type {ComponentRef} from 'react';
import type {View} from 'react-native';

import React from 'react';

import type {ReportActionsListProps} from './types';

import ReportActionsListFloatingMessageCounter from './ReportActionsListFloatingMessageCounter';
import useReportActionsListRenderItem from './useReportActionsListRenderItem';
import useReportActionsListScroll from './useReportActionsListScroll';
import useReportActionsListTelemetry from './useReportActionsListTelemetry';

/** Finished rows come from the provider; viewport, focus, and read updates belong to the mounted UI. */
function ReportActionsListContent({reportID, onLayout}: ReportActionsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {isProduction} = useEnvironment();
    const {
        report,
        hasNewerActions,
        transactionThreadReport,
        shouldShowConciergeWelcome,
        isConciergeHistoryExpanded,
        readReportActions,
        isReportArchived,
        shouldShowOfflineSkeleton,
        reportAttributes,
        linkedReportActionID,
        hasScrolledOverThreshold,
        unreadMarkerReportActionID,
        listData,
        isDraftPendingCompletion,
    } = useReportActionsListState();
    const {handleShowPreviousMessages: onShowPreviousMessages, collapseConciergeHistory, consumeSystemMessageFocusRequest} = useReportActionsListActions();
    const recordTimeToMeasureItemLayout = useReportActionsListTelemetry({reportID, onLayout});

    useLinkedMessageOfflineLoading({reportID: report?.reportID ?? reportID, reportActionIDFromRoute: linkedReportActionID});
    // The callout can unmount when the composer resizes; its dismissal lifetime follows the report.
    useRetireMerchantRuleSuggestionOnLeave(reportID);

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID,
        report,
        transactionThreadReport,
        sortedVisibleReportActions: readReportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
    });
    const {listID, listProps, shouldBeAlignedToTop, isFloatingMessageCounterVisible, isActionBadgeAboveViewport, scrollToBottomAndMarkReportAsRead, scrollToActionBadgeTarget} =
        useReportActionsListScroll({reportID, markNewestActionAsRead, completeSkippedMarkAsRead, onLayout: recordTimeToMeasureItemLayout});
    const focusExpandedMessage = (actionID: string, target: ComponentRef<typeof View> | null) => {
        if (!target || !consumeSystemMessageFocusRequest(actionID)) {
            return;
        }
        moveAccessibilityFocus(target);
    };
    const {renderItem, extraData} = useReportActionsListRenderItem({onExpandedSystemMessageReady: focusExpandedMessage});
    const listHeaderComponent = (
        <>
            {isConciergeHistoryExpanded && (
                <ConciergeChatHistoryToggle
                    isHistoryShown
                    onPress={collapseConciergeHistory}
                />
            )}
            <ReportActionsListHeader
                reportID={reportID}
                isDraftPendingCompletion={isDraftPendingCompletion}
            />
        </>
    );
    const listFooterComponent = shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : undefined;

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
            <MerchantRuleSuggestionBanner
                reportID={reportID}
                policyID={report.policyID}
                containerStyles={[styles.mh4, styles.mt2]}
                overlayStyles={styles.merchantRuleCalloutOverlay}
            />
            <ReportActionsListFloatingMessageCounter
                report={report}
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
                actionBadge={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.actionBadge : undefined}
                actionBadgeBrickRoadStatus={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.brickRoadStatus : undefined}
                onActionBadgePress={scrollToActionBadgeTarget}
            />
            <ReportActionsListPaddingView
                report={report}
                isReportArchived={isReportArchived}
            >
                <InvertedFlashList
                    {...listProps}
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={listData}
                    renderItem={renderItem}
                    drawDistance={1500}
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={styles.chatContentScrollView}
                    ListHeaderComponent={listHeaderComponent}
                    ListHeaderComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    extraData={extraData}
                    key={listID}
                />
            </ReportActionsListPaddingView>
        </>
    );
}

export default ReportActionsListContent;
