/** Owns LegendList positioning, end following, pagination, and scroll events for report actions. */
import allowLegendListItemOverflow from '@components/LegendList/allowLegendListItemOverflow';

import useEmitComposerScrollEvents from '@hooks/useEmitComposerScrollEvents';
import useReportActionsScroll from '@hooks/useReportActionsScroll';
import useReportScrollManager from '@hooks/useReportScrollManager';

import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useActionListContext, useActionListRef} from '@pages/inbox/ActionListContext';
import type {ActionListRef} from '@pages/inbox/ActionListTypes';
import {useReportActionsListActions, useReportActionsListState} from '@pages/inbox/report/ReportActionsListContext';
import useFollowActionBadgeTarget from '@pages/inbox/report/useFollowActionBadgeTarget';
import useScrollToEditingReportAction from '@pages/inbox/report/useScrollToEditingReportAction';

import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

import type {LegendListRef, OnViewableItemsChangedInfo} from '@legendapp/list/react-native';
import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent} from 'react-native';

import {useEffect, useImperativeHandle, useRef, useState} from 'react';

import type {ReportActionsListScrollMetrics, UseReportActionsListScrollParams} from './types';

import {getReportActionItemType, getReportActionKey} from './reportActionListUtils';

const PAGINATION_THRESHOLD = 0.75;

function useReportActionsListScroll({
    reportID,
    conciergeChat,
    sortedVisibleReportActions,
    renderedVisibleReportActions: listData,
    reportActionIDToDisplayIndex,
    markNewestActionAsRead,
    completeSkippedMarkAsRead,
    unreadMarkerReportActionID,
    unreadMarkerReportActionIndex,
    focusRequestedReportActionID,
    actionBadgeTargetID,
    isOffline,
    linkedReportActionID: reportActionIDFromRoute,
    onScrolledOverThresholdChange,
    onLayout,
}: UseReportActionsListScrollParams) {
    const {
        report,
        hasOnceLoadedReportActions,
        isInitialReportLoadPending,
        isLoadingOlderReportActions,
        hasLoadingOlderReportActionsError,
        hasOlderActions,
        hasNewerActions,
        oldestReportActionID,
        sortedAllReportActions,
        oldestUnreadReportAction,
        transactionThreadReport,
        parentReportAction,
        treatAsNoPaginationAnchor,
        isConciergeHiddenHistory,
        showFullHistory,
        allReportActionIDs,
    } = useReportActionsListState();
    const {setTreatAsNoPaginationAnchor, loadOlderChats, loadNewerChats, handleShowPreviousMessages} = useReportActionsListActions();
    const showHiddenHistory = isConciergeHiddenHistory && !showFullHistory;
    const lastRequestedOldestActionIDRef = useRef<string | undefined>(undefined);
    const emitComposerScrollEvents = useEmitComposerScrollEvents({enabled: true});

    // Clearing a link after sending returns to the live tail of the same list. Only opening a link
    // needs fresh initial positioning, including reopening the same action after its link was cleared.
    const [linkedActionListState, setLinkedActionListState] = useState({reportActionID: reportActionIDFromRoute, version: 0});
    if (linkedActionListState.reportActionID !== reportActionIDFromRoute) {
        setLinkedActionListState({
            reportActionID: reportActionIDFromRoute,
            version: linkedActionListState.version + (reportActionIDFromRoute ? 1 : 0),
        });
    }

    // OpenReport can first provide a tiny cached page and then replace it with the hydrated page. Remounting
    // gives the complete dataset a fresh initial layout so initialScrollAtEnd targets its actual end.
    const listID = [
        reportID,
        linkedActionListState.version,
        hasOnceLoadedReportActions ? 'hydrated' : 'initial',
        hasOnceLoadedReportActions ? undefined : oldestUnreadReportAction?.reportActionID,
    ].join(':');

    const {getScrollOffset, scrollOffsetRef} = useActionListContext();
    const listRef = useActionListRef();
    const legendListRef = useRef<LegendListRef>(null);

    useImperativeHandle(
        listRef,
        (): ActionListRef => ({
            getScrollableNode: (): unknown => legendListRef.current?.getScrollableNode(),
            getState: () => legendListRef.current?.getState(),
            computeVisibleIndices: () => {
                const state = legendListRef.current?.getState();
                return state ? {startIndex: state.start, endIndex: state.end} : undefined;
            },
            scrollToEnd: (options) => {
                legendListRef.current?.scrollToEnd(options);
            },
            scrollToIndex: (options) => {
                legendListRef.current?.scrollToIndex(options);
            },
            scrollToOffset: (options) => {
                legendListRef.current?.scrollToOffset(options);
            },
        }),
        [],
    );

    const shouldRestoreTailAfterHistoryRevealRef = useRef(false);
    const oldestLoadedActionID = allReportActionIDs.at(-1);
    const oldestLoadedActionIDAtHistoryRevealRef = useRef<string | undefined>(undefined);
    const distanceFromBottomRef = useRef(getScrollOffset());
    const shouldFollowEndOnResizeRef = useRef(false);
    const onShowPreviousMessages = () => {
        // Revealing older actions can make a short session scrollable before the requested history page arrives.
        // Follow the tail only when the reader was actually there; the action-visible threshold is much wider.
        shouldRestoreTailAfterHistoryRevealRef.current = distanceFromBottomRef.current <= 1 && !hasNewerActions;
        oldestLoadedActionIDAtHistoryRevealRef.current = shouldRestoreTailAfterHistoryRevealRef.current && hasOlderActions ? oldestLoadedActionID : undefined;
        if (shouldRestoreTailAfterHistoryRevealRef.current) {
            shouldFollowEndOnResizeRef.current = true;
        }
        handleShowPreviousMessages();
    };

    useEffect(() => {
        if (!showFullHistory) {
            shouldRestoreTailAfterHistoryRevealRef.current = false;
            return;
        }
        if (!shouldRestoreTailAfterHistoryRevealRef.current) {
            return;
        }
        const animationFrame = requestAnimationFrame(() => {
            if (!shouldRestoreTailAfterHistoryRevealRef.current || !shouldFollowEndOnResizeRef.current) {
                return;
            }
            legendListRef.current?.scrollToEnd({animated: false});
            const hasReceivedHistoryPage = oldestLoadedActionID !== oldestLoadedActionIDAtHistoryRevealRef.current || !hasOlderActions;
            if (!oldestLoadedActionIDAtHistoryRevealRef.current || (!isLoadingOlderReportActions && (hasReceivedHistoryPage || hasLoadingOlderReportActionsError))) {
                shouldRestoreTailAfterHistoryRevealRef.current = false;
            }
        });
        return () => cancelAnimationFrame(animationFrame);
    }, [showFullHistory, listData.length, oldestLoadedActionID, hasOlderActions, isLoadingOlderReportActions, hasLoadingOlderReportActionsError]);

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

    // Find the index of the action badge target in the chronological data rendered by LegendList.
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
        shouldBeAlignedToTop,
        initialScrollIndex,
        initialScrollIndexParams,
        onLoad,
        onItemSizeChanged,
        trackLinkedMessageScroll,
        stopLinkedMessagePositioning,
    } = useReportActionsScroll({
        listID,
        reportID,
        conciergeChat,
        report,
        transactionThreadReport,
        parentReportAction,
        sortedVisibleReportActions,
        renderedVisibleReportActions: listData,
        reportActionIDToDisplayIndex,
        keyExtractor: getReportActionKey,
        markNewestActionAsRead,
        completeSkippedMarkAsRead,
        unreadMarkerReportActionID,
        unreadMarkerReportActionIndex,
        hasNewerActions,
        actionBadgeTargetIndex,
        sortedAllReportActionsForPagination: sortedAllReportActions ?? [],
        treatAsNoPaginationAnchor,
        setTreatAsNoPaginationAnchor,
    });

    const [loadedInitialViewportListID, setLoadedInitialViewportListID] = useState<string>();
    // Cover every initial LegendList layout, including cached chats, until the rows are positioned.
    const shouldShowInitialViewportSkeleton = !isOffline && (isInitialReportLoadPending || loadedInitialViewportListID !== listID);

    const readyEndListIDRef = useRef<string | undefined>(undefined);
    const lastScrollMetricsRef = useRef<ReportActionsListScrollMetrics | undefined>(undefined);
    const endCorrectionFrameRef = useRef<number | undefined>(undefined);
    const userScrolledListIDRef = useRef<string | undefined>(undefined);

    const stopFollowingEnd = () => {
        userScrolledListIDRef.current = listID;
        shouldFollowEndOnResizeRef.current = false;
        shouldRestoreTailAfterHistoryRevealRef.current = false;
        if (endCorrectionFrameRef.current === undefined) {
            return;
        }
        cancelAnimationFrame(endCorrectionFrameRef.current);
        endCorrectionFrameRef.current = undefined;
    };

    const handleScrollBeginDrag = () => {
        stopLinkedMessagePositioning();
        stopFollowingEnd();
    };

    const scheduleEndCorrection = () => {
        if (readyEndListIDRef.current !== listID || !shouldFollowEndOnResizeRef.current || hasNewerActions || endCorrectionFrameRef.current !== undefined) {
            return;
        }
        endCorrectionFrameRef.current = requestAnimationFrame(() => {
            endCorrectionFrameRef.current = undefined;
            if (readyEndListIDRef.current === listID && shouldFollowEndOnResizeRef.current) {
                legendListRef.current?.scrollToEnd({animated: false});
            }
        });
    };

    useEffect(
        () => () => {
            if (endCorrectionFrameRef.current === undefined) {
                return;
            }
            cancelAnimationFrame(endCorrectionFrameRef.current);
            endCorrectionFrameRef.current = undefined;
        },
        [listID],
    );

    const updateVisibleItemOverflow = (info: OnViewableItemsChangedInfo<OnyxTypes.ReportAction>) => {
        viewableRowIndexesRef.current = new Set(info.viewableItems.map((token) => token.index));
        onViewableItemsChanged(info);
        for (const item of info.changed) {
            if (!item.isViewable) {
                continue;
            }
            allowLegendListItemOverflow(legendListRef.current, item.index);
        }
    };

    const handleListReady = () => {
        // onLoad only means rows rendered; keep their estimated positions covered until initial scrolling settles.
        onLoad();
        setLoadedInitialViewportListID(listID);
        readyEndListIDRef.current = listID;
        // An unread marker near the newest action lands at the end. Rows above it are still measured after
        // onReady, so keep that end in view instead of exposing older messages.
        const isUnreadInitialScroll = initialScrollIndex !== undefined && !reportActionIDFromRoute && !shouldBeAlignedToTop;
        const didLandAtEnd = initialScrollIndex === undefined || (isUnreadInitialScroll && !!legendListRef.current?.getState()?.isAtEnd);
        shouldFollowEndOnResizeRef.current = didLandAtEnd && !hasNewerActions && userScrolledListIDRef.current !== listID;
        lastScrollMetricsRef.current = undefined;
        // The final row can grow after LegendList's initial end estimate (for example, Concierge feedback).
        scheduleEndCorrection();
    };

    const loadOlderChatsOnStartReached = () => {
        if (showHiddenHistory || isOffline || !hasOlderActions || !oldestReportActionID || lastRequestedOldestActionIDRef.current === oldestReportActionID) {
            return;
        }

        lastRequestedOldestActionIDRef.current = oldestReportActionID;
        loadOlderChats(false);
    };

    const trackScrollPositionAndThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        trackLinkedMessageScroll(event);
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
        const distanceFromBottom = Math.max(0, contentSize.height - layoutMeasurement.height - contentOffset.y);
        distanceFromBottomRef.current = distanceFromBottom;
        const isNearStart = contentOffset.y <= layoutMeasurement.height * PAGINATION_THRESHOLD;
        const previousMetrics = lastScrollMetricsRef.current;
        if (readyEndListIDRef.current === listID && !hasNewerActions) {
            if (distanceFromBottom < CONST.REPORT.ACTIONS.AUTOSCROLL_TO_TOP_THRESHOLD) {
                shouldFollowEndOnResizeRef.current = true;
            } else if (
                (previousMetrics && contentOffset.y < previousMetrics.offset - 1) ||
                (previousMetrics &&
                    previousMetrics.contentHeight === contentSize.height &&
                    previousMetrics.viewportHeight === layoutMeasurement.height &&
                    endCorrectionFrameRef.current === undefined)
            ) {
                // A pending history request must not reclaim the end after the reader has moved away.
                stopFollowingEnd();
            }
        }
        lastScrollMetricsRef.current = {offset: contentOffset.y, contentHeight: contentSize.height, viewportHeight: layoutMeasurement.height};

        if (isNearStart) {
            loadOlderChatsOnStartReached();
        } else {
            lastRequestedOldestActionIDRef.current = undefined;
        }

        const bottomRelativeEvent = {
            ...event,
            nativeEvent: {
                ...event.nativeEvent,
                contentOffset: {...contentOffset, y: distanceFromBottom},
            },
        };

        trackVerticalScrolling(bottomRelativeEvent);
        onScrolledOverThresholdChange(distanceFromBottom >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
        emitComposerScrollEvents();
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

    // Keep bottom-relative scroll metrics current when the viewport is resized.
    const recordTimeToMeasureItemLayout = (event: LayoutChangeEvent) => {
        onLayout?.(event);
        const state = legendListRef.current?.getState();
        if (state && readyEndListIDRef.current === listID) {
            const distanceFromBottom = Math.max(0, state.contentLength - state.scrollLength - state.scroll);
            scrollOffsetRef.current = distanceFromBottom;
            distanceFromBottomRef.current = distanceFromBottom;
        }
        scheduleEndCorrection();
    };

    const trackContentSizeChange = () => {
        trackVerticalScrolling(undefined);
        scheduleEndCorrection();
    };

    return {
        listID,
        loadedInitialViewportListID,
        shouldShowInitialViewportSkeleton,
        shouldBeAlignedToTop,
        onShowPreviousMessages,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        legendListProps: {
            ref: legendListRef,
            keyExtractor: getReportActionKey,
            getItemType: getReportActionItemType,
            onEndReached: loadNewerChatsAfterTransitions,
            onEndReachedThreshold: PAGINATION_THRESHOLD,
            onLayout: recordTimeToMeasureItemLayout,
            onScroll: trackScrollPositionAndThreshold,
            onScrollBeginDrag: handleScrollBeginDrag,
            onStartReached: loadOlderChatsOnStartReached,
            onStartReachedThreshold: PAGINATION_THRESHOLD,
            onViewableItemsChanged: updateVisibleItemOverflow,
            initialScrollAtEnd: initialScrollIndex === undefined,
            initialScrollIndex: initialScrollIndex === undefined ? undefined : {index: initialScrollIndex, ...initialScrollIndexParams},
            alignItemsAtEnd: !shouldBeAlignedToTop,
            onReady: handleListReady,
            onItemSizeChanged,
            onContentSizeChange: trackContentSizeChange,
        },
    };
}

export default useReportActionsListScroll;
