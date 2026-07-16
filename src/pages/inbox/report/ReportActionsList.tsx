import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlashList from '@components/FlashList/InvertedFlashList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';

import useEnvironment from '@hooks/useEnvironment';
import useLinkedMessageOfflineLoading from '@hooks/useLinkedMessageOfflineLoading';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';
import useWindowDimensions from '@hooks/useWindowDimensions';

import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    getFirstVisibleReportActionID,
    getReportActionHtml,
    getReportActionMessage,
    isConsecutiveActionMadeByPreviousActor,
    isDeletedParentAction,
    isNewerReportAction,
    isReversedTransaction,
    isTransactionThread,
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
    shouldShowMarkAsDone,
} from '@libs/ReportUtils';
import markOpenReportEnd from '@libs/telemetry/markOpenReportEnd';

import type {ReportsSplitNavigatorParamList} from '@navigation/types';

import {useActionListContext, useActionListRef} from '@pages/inbox/ActionListContext';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';

import type {ListRenderItemInfo} from '@shopify/flash-list';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';

import {useRoute} from '@react-navigation/native';
import {isTrackIntentUserSelector} from '@selectors/Onboarding';
import React, {useEffect, useRef, useState} from 'react';

import FloatingMessageCounter from './FloatingMessageCounter';
import ReportActionIndexContext from './ReportActionIndexContext';
import {useReportActionsListActions, useReportActionsListState} from './ReportActionsListContext';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ReportActionsListPaddingView from './ReportActionsListPaddingView';
import ReportActionsSkeletonGuard from './ReportActionsSkeletonGuard';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';
import useFollowActionBadgeTarget from './useFollowActionBadgeTarget';

type ReportActionsListProps = {
    /** The ID of the report to display actions for */
    reportID: string;

    /** Callback executed on list layout */
    onLayout?: (event: LayoutChangeEvent) => void;
};

/**
 * Create a unique key for each action in the FlatList.
 * We use the reportActionID that is a string representation of a random 64-bit int, which should be
 * random enough to avoid collisions
 */
function keyExtractor(item: OnyxTypes.ReportAction): string {
    // A report has exactly one CREATED action. Using a stable key lets FlashList recycle the same cell
    // when the optimistic CREATED is swapped for the server one, avoiding a remount-induced scroll jump.
    if (item.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return CONST.REPORT.ACTIONS.TYPE.CREATED;
    }
    return item.reportActionID;
}

/**
 * Renders the report-actions list. Reads its data from `ReportActionsListStateContext` / `ReportActionsListActionsContext` and holds the
 * UI-close hooks (`useUnreadMarker` / `useMarkAsRead` / `useReportActionsScroll`). `ReportActionsSkeletonGuard`
 * mounts it only once content is ready, so those hooks never run while a skeleton shows.
 */
function ReportActionsListContent({reportID, onLayout}: ReportActionsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isProduction} = useEnvironment();

    const {
        report,
        hasOnceLoadedReportActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportActionForTransactionThread,
        treatAsNoPaginationAnchor,
        parentReportAction,
        sortedReportActions,
        sortedVisibleReportActions,
        isConciergeHiddenHistory,
        showFullHistory,
        hasPreviousMessages,
    } = useReportActionsListState();

    const {setTreatAsNoPaginationAnchor, loadOlderChats, loadNewerChats, handleShowPreviousMessages} = useReportActionsListActions();

    const {isOffline} = useNetwork();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const reportActionIDFromRoute = route?.params?.reportActionID;
    const {sessionStartTime} = useConciergeSessionState();

    const didLayout = useRef(false);

    useEffect(() => {
        didLayout.current = false;
    }, [reportID]);

    useLinkedMessageOfflineLoading({reportID: report?.reportID ?? reportID, reportActionIDFromRoute});

    // Remount the list when the deep-linked message or unread anchor changes (scroll positioning), or when the report changes.
    const listID = [reportID, reportActionIDFromRoute, hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID].join(':');

    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${reportID}`);
    const isReportArchived = !!isArchivedReport(reportNameValuePairs);
    const [isTrackIntentUser] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED, {selector: isTrackIntentUserSelector});
    const [policy] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY}${getNonEmptyStringOnyxID(report?.policyID)}`);

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

    const linkedReportActionID = reportActionIDFromRoute;

    const {getScrollOffset} = useActionListContext();
    const listRef = useActionListRef();

    const {draftReportAction, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft, revealDraftFromReportAction} = useConciergeDraftActions();

    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;
    const onShowPreviousMessages = handleShowPreviousMessages;

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(() => getScrollOffset() >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);

    const {unreadMarkerReportActionID, unreadMarkerReportActionIndex} = useUnreadMarker({
        reportID,
        sortedVisibleReportActions,
        sortedReportActions,
        oldestUnreadReportActionID: oldestUnreadReportAction?.reportActionID,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!hasOnceLoadedReportActions,
    });

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID,
        report,
        transactionThreadReport,
        sortedVisibleReportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
    });

    const persistedDraftReportAction = draftReportAction ? sortedVisibleReportActions.find((action) => action.reportActionID === draftReportAction.reportActionID) : undefined;

    const renderedVisibleReportActions = (() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && sessionStartTime && draftReportAction.created < sessionStartTime) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic draft into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === draftReportAction.reportActionID) {
                const isDraftStillRevealingPersistedAction = getReportActionHtml(action) !== getReportActionHtml(draftReportAction);
                if (!isDraftPendingCompletion && !isDraftStillRevealingPersistedAction) {
                    return sortedVisibleReportActions;
                }

                const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
                visibleReportActionsWithDraft[index] = draftReportAction;
                return visibleReportActionsWithDraft;
            }
            if (isNewerReportAction(draftReportAction, action)) {
                const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
                visibleReportActionsWithDraft.splice(index, 0, draftReportAction);
                return visibleReportActionsWithDraft;
            }
        }

        const visibleReportActionsWithDraft = [...sortedVisibleReportActions];
        visibleReportActionsWithDraft.push(draftReportAction);
        return visibleReportActionsWithDraft;
    })();

    const draftMessageHTML = draftReportAction ? getReportActionMessage(draftReportAction)?.html : undefined;
    const draftReportActionID = draftReportAction?.reportActionID;
    const isSyntheticDraftVisible = !!draftReportAction && renderedVisibleReportActions !== sortedVisibleReportActions;
    const draftAutoScrollKey = isSyntheticDraftVisible ? `${draftReportAction.reportActionID}:${draftMessageHTML ?? ''}` : '';

    useEffect(() => {
        if (!draftReportAction || isSyntheticDraftVisible) {
            return;
        }

        clearDraft();
    }, [clearDraft, draftReportAction, isSyntheticDraftVisible]);

    useEffect(() => {
        if (!draftReportAction || !persistedDraftReportAction || getReportActionHtml(draftReportAction) === getReportActionHtml(persistedDraftReportAction)) {
            return;
        }

        revealDraftFromReportAction(persistedDraftReportAction);
    }, [draftReportAction, persistedDraftReportAction, revealDraftFromReportAction]);

    // Find the index of the action badge target in the rendered actions list (which is what the FlatList uses as data)
    const actionBadgeTargetID = reportAttributes?.actionTargetReportActionID;
    const actionBadgeTargetIndex = actionBadgeTargetID ? renderedVisibleReportActions.findIndex((action) => action.reportActionID === actionBadgeTargetID) : -1;

    const {
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        flushPendingScrollToBottom,
        shouldBeAlignedToTop,
        shouldFocusToTopOnMount,
        initialScrollIndex,
        initialScrollIndexParams,
        maintainVisibleContentPosition,
        onLoad,
    } = useReportActionsScroll({
        reportID,
        report,
        transactionThreadReport,
        parentReportAction,
        sortedVisibleReportActions,
        renderedVisibleReportActions,
        keyExtractor,
        hasScrolledOverThreshold,
        markNewestActionAsRead,
        completeSkippedMarkAsRead,
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex,
        hasNewerActions,
        draftAutoScrollKey,
        actionBadgeTargetIndex,
        sortedAllReportActionsForPagination: sortedAllReportActions ?? [],
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
    });

    const trackScrollPositionAndThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        trackVerticalScrolling(event);
        setHasScrolledOverThreshold(event.nativeEvent.contentOffset.y >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
    };

    const loadOlderChatsOnEndReached = () => {
        if (showHiddenHistory) {
            return;
        }
        loadOlderChats(false);
    };

    const loadNewerChatsAfterTransitions = () => {
        if (!isSearchTopmostFullScreenRoute()) {
            loadNewerChats(false);
            return;
        }

        TransitionTracker.runAfterTransitions({
            callback: () => {
                requestAnimationFrame(() => loadNewerChats(false));
            },
        });
    };

    const firstVisibleReportActionID = getFirstVisibleReportActionID(sortedReportActions, isOffline);

    useFollowActionBadgeTarget({
        isProduction,
        reportID,
        actionTargetReportActionID: reportAttributes?.actionTargetReportActionID,
        actionBadgeTargetIndex,
        actionBadge: reportAttributes?.actionBadge,
        renderedVisibleReportActions,
        scrollToActionBadgeTarget,
    });

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

        return isExpenseReport(report) || isIOUReport(report) || isInvoiceReport(report);
    })();

    const renderItem = ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
        const shouldDisableContextMenuForConciergeDraft = draftReportActionID === reportAction.reportActionID;

        return (
            <ReportActionIndexContext.Provider value={index}>
                <ReportActionsListItemRenderer
                    reportAction={reportAction}
                    parentReportAction={parentReportAction}
                    parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                    report={reportStable}
                    transactionThreadReport={transactionThreadReport}
                    chatReport={chatReportStable}
                    linkedReportActionID={linkedReportActionID}
                    displayAsGroup={
                        !isConsecutiveChronosAutomaticTimerAction(renderedVisibleReportActions, index, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                        isConsecutiveActionMadeByPreviousActor(renderedVisibleReportActions, index, isOffline)
                    }
                    shouldHideThreadDividerLine={shouldHideThreadDividerLine}
                    shouldDisplayNewMarker={reportAction.reportActionID === unreadMarkerReportActionID}
                    shouldDisplayReplyDivider={renderedVisibleReportActions.length > 1}
                    isFirstVisibleReportAction={firstVisibleReportActionID === reportAction.reportActionID}
                    shouldUseThreadDividerLine={shouldUseThreadDividerLine}
                    isHarvestCreatedExpenseReport={isHarvestCreatedExpenseReportAction}
                    shouldDisableContextMenuForConciergeDraft={shouldDisableContextMenuForConciergeDraft}
                />
                {!!reportStable?.reportID && (
                    <ShowPreviousMessagesButton
                        reportID={reportStable.reportID}
                        actionType={reportAction.actionName}
                        hasPreviousMessages={!!hasPreviousMessages}
                        showFullHistory={!showHiddenHistory}
                        onPress={onShowPreviousMessages}
                    />
                )}
            </ReportActionIndexContext.Provider>
        );
    };

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined, isArchivedNonExpenseReport(report, isReportArchived), draftReportActionID, draftMessageHTML];

    const listHeaderComponent = (
        <ReportActionsListHeader
            reportID={reportID}
            isDraftPendingCompletion={isDraftPendingCompletion}
        />
    );

    const shouldShowOfflineSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = shouldShowOfflineSkeleton ? <ReportActionsSkeletonView shouldAnimate={false} /> : undefined;

    const shouldUseMarkAsDoneCopy = shouldShowMarkAsDone({
        policy,
        report,
        isTrackIntentUser,
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

    // The guard only mounts this content when the report is loaded, so this is effectively unreachable.
    // It narrows `report` to non-undefined for the render below and stays a safe fallback if the report
    // is cleared mid-session while the latch keeps the content mounted.
    if (!report) {
        return <ReportActionsSkeletonView />;
    }

    return (
        <>
            <FloatingMessageCounter
                hasNewMessages={!!unreadMarkerReportActionID}
                isActive={isFloatingMessageCounterVisible}
                onClick={scrollToBottomAndMarkReportAsRead}
                actionBadge={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.actionBadge : undefined}
                actionBadgeBrickRoadStatus={!isProduction && isActionBadgeAboveViewport ? reportAttributes?.brickRoadStatus : undefined}
                onActionBadgePress={scrollToActionBadgeTarget}
                isMarkAsDone={shouldUseMarkAsDoneCopy}
            />
            <ReportActionsListPaddingView
                report={report}
                isReportArchived={isReportArchived}
            >
                <InvertedFlashList
                    accessibilityLabel={translate('sidebarScreen.listOfChatMessages')}
                    ref={listRef}
                    testID="report-actions-list"
                    style={styles.overscrollBehaviorContain}
                    data={renderedVisibleReportActions}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    drawDistance={1500}
                    renderScrollComponent={renderActionSheetAwareScrollView}
                    contentContainerStyle={styles.chatContentScrollView}
                    onEndReached={loadOlderChatsOnEndReached}
                    onEndReachedThreshold={0.75}
                    onStartReached={loadNewerChatsAfterTransitions}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={listHeaderComponent}
                    ListHeaderComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    onLayout={(event) => {
                        recordTimeToMeasureItemLayout(event);
                        flushPendingScrollToBottom();
                    }}
                    onScroll={trackScrollPositionAndThreshold}
                    onViewableItemsChanged={onViewableItemsChanged}
                    extraData={extraData}
                    key={listID}
                    overrideProps={{
                        isInvertedVirtualizedList: true,
                        contentOffset: shouldFocusToTopOnMount ? {x: 0, y: windowHeight} : undefined,
                    }}
                    getItemType={(item) => item.actionName}
                    initialScrollIndex={initialScrollIndex}
                    initialScrollIndexParams={initialScrollIndexParams}
                    maintainVisibleContentPosition={maintainVisibleContentPosition}
                    onLoad={onLoad}
                    onContentSizeChange={() => {
                        trackVerticalScrolling(undefined);
                    }}
                />
            </ReportActionsListPaddingView>
        </>
    );
}

/**
 * Public report-actions list. Thin composition that wraps the content in `ReportActionsSkeletonGuard`,
 * which owns the data pipeline + skeleton decision and only mounts the content once it is ready.
 */
function ReportActionsList({reportID, onLayout}: ReportActionsListProps) {
    return (
        <ReportActionsSkeletonGuard reportID={reportID}>
            <ReportActionsListContent
                reportID={reportID}
                onLayout={onLayout}
            />
        </ReportActionsSkeletonGuard>
    );
}

export default ReportActionsList;
