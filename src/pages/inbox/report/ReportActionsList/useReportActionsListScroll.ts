import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useWindowDimensions from '@hooks/useWindowDimensions';

import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useActionListRef} from '@pages/inbox/ActionListContext';
import {useReportActionsListActions, useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import useFollowActionBadgeTarget from '@pages/inbox/report/useFollowActionBadgeTarget';
import useScrollToEditingReportAction from '@pages/inbox/report/useScrollToEditingReportAction';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';

import {useEffect, useRef} from 'react';

import type {UseReportActionsListScrollParams} from './types';

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

/** Owns initial positioning, pagination, unread tracking, and scroll events for the report-actions list. */
function useReportActionsListScroll({
    reportID,
    sortedVisibleReportActions,
    renderedVisibleReportActions: listData,
    reportActionIDToDisplayIndex,
    hasScrolledOverThreshold,
    markNewestActionAsRead,
    completeSkippedMarkAsRead,
    unreadMarkerReportActionID,
    unreadMarkerReportActionIndex,
    draftAutoScrollKey,
    focusRequestedReportActionID,
    actionBadgeTargetID,
    linkedReportActionID,
    onScrolledOverThresholdChange,
    onLayout,
}: UseReportActionsListScrollParams) {
    const {windowHeight} = useWindowDimensions();
    const {
        report,
        hasOnceLoadedReportActions,
        hasNewerActions,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportAction,
        treatAsNoPaginationAnchor,
        isConciergeHiddenHistory,
        showFullHistory,
    } = useReportActionsListState();
    const {setTreatAsNoPaginationAnchor, loadOlderChats, loadNewerChats} = useReportActionsListActions();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;

    // Remount the list when the deep-linked message or unread anchor changes (scroll positioning), or when the report changes.
    const listID = [reportID, linkedReportActionID, hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID].join(':');

    const listRef = useActionListRef();
    const reportScrollManager = useReportScrollManager();

    // Which rows are on screen, tracked so an edit started on a message the user can already see doesn't move the list.
    const viewableRowIndexesRef = useRef<Set<number>>(new Set());

    const expandedFocusIndex = focusRequestedReportActionID ? (reportActionIDToDisplayIndex.get(focusRequestedReportActionID) ?? -1) : -1;
    useEffect(() => {
        if (expandedFocusIndex < 0 || viewableRowIndexesRef.current.has(expandedFocusIndex)) {
            return;
        }

        // An off-window revealed message must mount before it can hand off focus.
        const frame = requestAnimationFrame(() => {
            listRef.current?.scrollToIndex({index: expandedFocusIndex, animated: false, viewPosition: 0.5});
        });
        return () => cancelAnimationFrame(frame);
    }, [expandedFocusIndex, focusRequestedReportActionID, listRef]);

    // The rendered indexes are known here, so scrolling the row into view mounts it and keeps the message visible while it's edited.
    useScrollToEditingReportAction({
        visibleReportActions: listData,
        scrollToIndex: (index) => {
            // Already on screen, so its editor has mounted and taken focus — scrolling would only yank the user.
            if (viewableRowIndexesRef.current.has(index)) {
                return;
            }

            reportScrollManager.scrollToIndex(index, {animated: false, viewPosition: 0.5});
        },
    });

    // Find the index of the action badge target in the rendered actions list (which is what the FlatList uses as data)
    const actionBadgeTargetIndex = actionBadgeTargetID
        ? (reportActionIDToDisplayIndex.get(actionBadgeTargetID) ?? listData.findIndex((action) => action.reportActionID === actionBadgeTargetID))
        : -1;

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
        renderedVisibleReportActions: listData,
        reportActionIDToDisplayIndex,
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
        onScrolledOverThresholdChange(event.nativeEvent.contentOffset.y >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
    };

    const trackViewableRowIndexes = (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        viewableRowIndexesRef.current = new Set(info.viewableItems.map((token) => token.index).filter((index) => index !== null));
        onViewableItemsChanged(info);
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

    useFollowActionBadgeTarget({
        reportID,
        actionTargetReportActionID: actionBadgeTargetID,
        actionBadgeTargetIndex,
        renderedVisibleReportActions: listData,
        reportActionIDToDisplayIndex,
        scrollToActionBadgeTarget,
    });

    return {
        listID,
        shouldBeAlignedToTop,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        listProps: {
            ref: listRef,
            keyExtractor,
            getItemType: (item: OnyxTypes.ReportAction) => item.actionName,
            onEndReached: loadOlderChatsOnEndReached,
            onEndReachedThreshold: 0.75,
            onStartReached: loadNewerChatsAfterTransitions,
            onStartReachedThreshold: 0.75,
            onLayout: (event: LayoutChangeEvent) => {
                onLayout?.(event);
                flushPendingScrollToBottom();
            },
            onScroll: trackScrollPositionAndThreshold,
            onViewableItemsChanged: trackViewableRowIndexes,
            overrideProps: {
                isInvertedVirtualizedList: true,
                contentOffset: shouldFocusToTopOnMount ? {x: 0, y: windowHeight} : undefined,
            },
            initialScrollIndex,
            initialScrollIndexParams,
            maintainVisibleContentPosition,
            onLoad,
            onContentSizeChange: () => {
                trackVerticalScrolling(undefined);
                flushPendingScrollToBottom();
            },
        },
    };
}

export default useReportActionsListScroll;
