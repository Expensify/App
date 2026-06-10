import {useRoute} from '@react-navigation/native';
import type {ListRenderItemInfo} from '@shopify/flash-list';
import React, {memo, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {renderScrollComponent as renderActionSheetAwareScrollView} from '@components/ActionSheetAwareScrollView';
import InvertedFlashList from '@components/FlashList/InvertedFlashList';
import ReportActionsSkeletonView from '@components/ReportActionsSkeletonView';
import useEnvironment from '@hooks/useEnvironment';
import useLocalize from '@hooks/useLocalize';
import useMarkAsRead from '@hooks/useMarkAsRead';
import useNetworkWithOfflineStatus from '@hooks/useNetworkWithOfflineStatus';
import useOnyx from '@hooks/useOnyx';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useReportIsArchived from '@hooks/useReportIsArchived';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useUnreadMarker from '@hooks/useUnreadMarker';
import useWindowDimensions from '@hooks/useWindowDimensions';
import {isConsecutiveChronosAutomaticTimerAction} from '@libs/ChronosUtils';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import type {PlatformStackRouteProp} from '@libs/Navigation/PlatformStackNavigation/types';
import TransitionTracker from '@libs/Navigation/TransitionTracker';
import {
    getFirstVisibleReportActionID,
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
    isCanceledTaskReport,
    isExpenseReport,
    isHarvestCreatedExpenseReport,
    isInvoiceReport,
    isIOUReport,
    isTaskReport,
} from '@libs/ReportUtils';
import type {ReportsSplitNavigatorParamList} from '@navigation/types';
import {useConciergeDraft, useConciergeDraftActions} from '@pages/inbox/ConciergeDraftContext';
import {useConciergeSessionState} from '@pages/inbox/ConciergeSessionContext';
import {ActionListContext} from '@pages/inbox/ReportScreenContext';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type SCREENS from '@src/SCREENS';
import {getStableReportSelector} from '@src/selectors/Report';
import type * as OnyxTypes from '@src/types/onyx';
import FloatingMessageCounter from './FloatingMessageCounter';
import ReportActionIndexContext from './ReportActionIndexContext';
import ReportActionsListHeader from './ReportActionsListHeader';
import ReportActionsListItemRenderer from './ReportActionsListItemRenderer';
import ReportActionsListPaddingView from './ReportActionsListPaddingView';
import ShowPreviousMessagesButton from './ShowPreviousMessagesButton';

type ReportActionsListProps = {
    /** The report currently being looked at */
    report: OnyxTypes.Report;

    /** The transaction thread report associated with the current report, if any */
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;

    /** The report's parentReportAction */
    parentReportAction: OnyxEntry<OnyxTypes.ReportAction>;

    /** The transaction thread report's parentReportAction */
    parentReportActionForTransactionThread: OnyxEntry<OnyxTypes.ReportAction>;

    /** Sorted actions prepared for display */
    sortedReportActions: OnyxTypes.ReportAction[];

    /** Sorted actions that should be visible to the user */
    sortedVisibleReportActions: OnyxTypes.ReportAction[];

    /** Callback executed on list layout */
    onLayout: (event: LayoutChangeEvent) => void;

    /** Callback executed on scroll */
    onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** Function to load more chats */
    loadOlderChats: (force?: boolean) => void;

    /** Function to load newer chats */
    loadNewerChats: (force?: boolean) => void;

    /** Whether the report has newer actions to load */
    hasNewerActions: boolean;

    /** The oldest unread report action */
    oldestUnreadReportAction?: OnyxEntry<OnyxTypes.ReportAction> | undefined;

    /** Full sorted report actions for collapsing stale pagination after a live-tail jump */
    sortedAllReportActionsForPagination: OnyxTypes.ReportAction[];

    /** When true, the paginated hook ignores deep-link / unread anchors */
    treatAsNoPaginationAnchor: boolean;

    setTreatAsNoPaginationAnchor: (value: boolean) => void;

    /** Stable key to remount the list when the deep-linked action or unread anchor (or report) changes */
    listID: string;

    /** Whether the chat history is hidden (concierge side panel fresh state) */
    showHiddenHistory?: boolean;

    /** Whether there are previous messages that can be revealed */
    hasPreviousMessages?: boolean;

    /** Callback to show previous messages */
    onShowPreviousMessages?: () => void;
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

function ReportActionsList({
    report,
    transactionThreadReport,
    parentReportAction,
    sortedReportActions,
    sortedVisibleReportActions,
    onScroll,
    loadNewerChats,
    loadOlderChats,
    hasNewerActions,
    oldestUnreadReportAction,
    sortedAllReportActionsForPagination,
    treatAsNoPaginationAnchor,
    setTreatAsNoPaginationAnchor,
    onLayout,
    listID,
    parentReportActionForTransactionThread,
    showHiddenHistory,
    hasPreviousMessages,
    onShowPreviousMessages,
}: ReportActionsListProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {windowHeight} = useWindowDimensions();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isProduction} = useEnvironment();

    const {isOffline} = useNetworkWithOfflineStatus();
    const route = useRoute<PlatformStackRouteProp<ReportsSplitNavigatorParamList, typeof SCREENS.REPORT>>();
    const {scrollOffsetRef} = useContext(ActionListContext);
    const {draftReportAction, hasActiveDraft, isDraftPendingCompletion} = useConciergeDraft();
    const {clearDraft} = useConciergeDraftActions();
    const {sessionStartTime: conciergeSessionStartTime} = useConciergeSessionState();

    const isReportArchived = useReportIsArchived(report?.reportID);
    const [reportLoadingState] = useOnyx(`${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${report.reportID}`);
    const [reportNameValuePairs] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`);
    const reportAttributesSelector = useCallback(
        (value: OnyxEntry<OnyxTypes.ReportAttributesDerivedValue>) => {
            const attrs = value?.reports?.[report.reportID];
            if (!attrs) {
                return undefined;
            }
            return {
                actionBadge: attrs.actionBadge,
                actionTargetReportActionID: attrs.actionTargetReportActionID,
                brickRoadStatus: attrs.brickRoadStatus,
            };
        },
        [report.reportID],
    );
    const [reportAttributes] = useOnyx(ONYXKEYS.DERIVED.REPORT_ATTRIBUTES, {
        selector: reportAttributesSelector,
    });
    const isHarvestCreatedExpenseReportAction = isHarvestCreatedExpenseReport(reportNameValuePairs?.origin, reportNameValuePairs?.originalID);

    const [reportStable] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {selector: getStableReportSelector});

    const linkedReportActionID = route?.params?.reportActionID;

    const hasHeaderRendered = useRef(false);

    const [hasScrolledOverThreshold, setHasScrolledOverThreshold] = useState(() => scrollOffsetRef.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);

    const {unreadMarkerReportActionID, unreadMarkerReportActionIndex} = useUnreadMarker({
        reportID: report.reportID,
        sortedVisibleReportActions,
        sortedReportActions,
        oldestUnreadReportActionID: oldestUnreadReportAction?.reportActionID,
        isScrolledOverThreshold: hasScrolledOverThreshold,
        hasOnceLoadedReportActions: !!reportLoadingState?.hasOnceLoadedReportActions,
    });

    const {markNewestActionAsRead, completeSkippedMarkAsRead} = useMarkAsRead({
        reportID: report.reportID,
        report,
        transactionThreadReport,
        sortedVisibleReportActions,
        isScrolledToEnd: !hasScrolledOverThreshold,
        hasNewerActions,
    });

    const renderedVisibleReportActions = useMemo(() => {
        if (!draftReportAction) {
            return sortedVisibleReportActions;
        }

        if (showHiddenHistory && conciergeSessionStartTime && draftReportAction.created < conciergeSessionStartTime) {
            return sortedVisibleReportActions;
        }

        // Insert the synthetic draft into the already-descending render list without treating it as a persisted report action.
        for (const [index, action] of sortedVisibleReportActions.entries()) {
            if (action.reportActionID === draftReportAction.reportActionID) {
                if (!isDraftPendingCompletion) {
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
    }, [conciergeSessionStartTime, draftReportAction, isDraftPendingCompletion, showHiddenHistory, sortedVisibleReportActions]);

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

    // Find the index of the action badge target in the rendered actions list (which is what the FlatList uses as data)
    const actionBadgeTargetIndex = useMemo(() => {
        const targetID = reportAttributes?.actionTargetReportActionID;
        if (!targetID) {
            return -1;
        }
        return renderedVisibleReportActions.findIndex((action) => action.reportActionID === targetID);
    }, [reportAttributes?.actionTargetReportActionID, renderedVisibleReportActions]);

    const {
        listRef,
        trackVerticalScrolling,
        onViewableItemsChanged,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        flushPendingScrollToBottom,
        shouldBeAlignedToTop,
        shouldFocusToTopOnMount,
        initialScrollKey,
        shouldAutoscrollToBottom,
        onLoad,
    } = useReportActionsScroll({
        report,
        transactionThreadReport,
        parentReportAction,
        sortedVisibleReportActions,
        markNewestActionAsRead,
        completeSkippedMarkAsRead,
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex,
        hasNewerActions,
        draftAutoScrollKey,
        actionBadgeTargetIndex,
        sortedAllReportActionsForPagination,
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
    });

    const trackScrollPositionAndThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        trackVerticalScrolling(event);
        setHasScrolledOverThreshold(event.nativeEvent.contentOffset.y >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
        onScroll?.(event);
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

    const shouldMaintainVisibleContentPosition = hasScrolledOverThreshold || shouldFocusToTopOnMount;

    // Same-screen report switches reuse this instance; per-report one-shot flags must not leak across reports.
    useEffect(() => {
        hasHeaderRendered.current = false;
    }, [report.reportID]);

    /**
     * Thread's divider line should hide when the first chat in the thread is marked as unread.
     * This is so that it will not be conflicting with header's separator line.
     */
    const shouldHideThreadDividerLine = useMemo(
        (): boolean => getFirstVisibleReportActionID(sortedReportActions, isOffline) === unreadMarkerReportActionID,
        [sortedReportActions, isOffline, unreadMarkerReportActionID],
    );

    const firstVisibleReportActionID = useMemo(() => getFirstVisibleReportActionID(sortedReportActions, isOffline), [sortedReportActions, isOffline]);

    const shouldUseThreadDividerLine = useMemo(() => {
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
    }, [parentReportAction, renderedVisibleReportActions, report]);

    // Precompute a reportActionID -> index map so renderItem can resolve the real index in O(1)
    // instead of scanning renderedVisibleReportActions with indexOf on every render.
    const actionIndexMap = useMemo(() => {
        const map = new Map<string, number>();
        for (const [i, action] of renderedVisibleReportActions.entries()) {
            map.set(action.reportActionID, i);
        }
        return map;
    }, [renderedVisibleReportActions]);

    const renderItem = useCallback(
        ({item: reportAction, index}: ListRenderItemInfo<OnyxTypes.ReportAction>) => {
            // Use the action's actual index in sortedVisibleReportActions rather than the FlashList-provided index,
            // because useFlashListScrollKey may slice the data for deep-link scroll positioning, making the
            // FlashList index offset from the full array and causing wrong displayAsGroup computation.
            const safeIndex = actionIndexMap.get(reportAction.reportActionID) ?? index;
            const shouldDisableContextMenuForConciergeDraft = draftReportActionID === reportAction.reportActionID;

            return (
                <ReportActionIndexContext.Provider value={index}>
                    <ReportActionsListItemRenderer
                        reportAction={reportAction}
                        parentReportAction={parentReportAction}
                        parentReportActionForTransactionThread={parentReportActionForTransactionThread}
                        report={reportStable}
                        transactionThreadReport={transactionThreadReport}
                        linkedReportActionID={linkedReportActionID}
                        displayAsGroup={
                            !isConsecutiveChronosAutomaticTimerAction(renderedVisibleReportActions, safeIndex, chatIncludesChronosWithID(reportAction?.reportID), isOffline) &&
                            isConsecutiveActionMadeByPreviousActor(renderedVisibleReportActions, safeIndex, isOffline)
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
        },
        [
            actionIndexMap,
            draftReportActionID,
            firstVisibleReportActionID,
            hasPreviousMessages,
            isOffline,
            linkedReportActionID,
            onShowPreviousMessages,
            parentReportAction,
            parentReportActionForTransactionThread,
            isHarvestCreatedExpenseReportAction,
            renderedVisibleReportActions,
            reportStable,
            shouldHideThreadDividerLine,
            shouldUseThreadDividerLine,
            showHiddenHistory,
            transactionThreadReport,
            unreadMarkerReportActionID,
        ],
    );

    // Native mobile does not render updates flatlist the changes even though component did update called.
    // To notify there something changes we can use extraData prop to flatlist
    const extraData = useMemo(
        () => [shouldUseNarrowLayout ? unreadMarkerReportActionID : undefined, isArchivedNonExpenseReport(report, isReportArchived), draftReportActionID, draftMessageHTML],
        [draftMessageHTML, draftReportActionID, unreadMarkerReportActionID, shouldUseNarrowLayout, report, isReportArchived],
    );
    const canShowHeader = isOffline || hasHeaderRendered.current;

    const listHeaderComponent = useMemo(() => {
        // In case of an error we want to display the header no matter what.
        if (!canShowHeader) {
            hasHeaderRendered.current = true;

            // Empty spacer so FlashList wraps a header and ListHeaderComponentStyle (flex: 1) applies —
            // the wrapper sits at the visual bottom of the inverted list and pins items to the visual top.
            return shouldBeAlignedToTop ? <View /> : null;
        }

        return (
            <ReportActionsListHeader
                reportID={report.reportID}
                onRetry={() => loadNewerChats(true)}
                hasActiveDraft={hasActiveDraft}
            />
        );
    }, [canShowHeader, hasActiveDraft, report.reportID, loadNewerChats, shouldBeAlignedToTop]);

    const shouldShowSkeleton = isOffline && !sortedVisibleReportActions.some((action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);

    const listFooterComponent = useMemo(() => {
        if (!shouldShowSkeleton) {
            return;
        }

        return <ReportActionsSkeletonView shouldAnimate={false} />;
    }, [shouldShowSkeleton]);

    return (
        <>
            <FloatingMessageCounter
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
                    onEndReached={() => loadOlderChats(false)}
                    onEndReachedThreshold={0.75}
                    onStartReached={loadNewerChatsAfterTransitions}
                    onStartReachedThreshold={0.75}
                    ListHeaderComponent={listHeaderComponent}
                    ListHeaderComponentStyle={shouldBeAlignedToTop ? styles.flex1 : undefined}
                    ListFooterComponent={listFooterComponent}
                    keyboardShouldPersistTaps="handled"
                    onLayout={(event) => {
                        onLayout(event);
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
                    shouldMaintainVisibleContentPosition={shouldMaintainVisibleContentPosition}
                    initialScrollIndex={shouldFocusToTopOnMount ? renderedVisibleReportActions.length - 1 : undefined}
                    initialScrollIndexParams={shouldFocusToTopOnMount ? {viewOffset: windowHeight} : undefined}
                    maintainVisibleContentPosition={
                        shouldAutoscrollToBottom ? {autoscrollToBottomThreshold: CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD, animateAutoScrollToBottom: false} : undefined
                    }
                    onLoad={onLoad}
                    initialScrollKey={initialScrollKey}
                    onContentSizeChange={() => {
                        trackVerticalScrolling(undefined);
                    }}
                />
            </ReportActionsListPaddingView>
        </>
    );
}

export default memo(ReportActionsList);
