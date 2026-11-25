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

import {useIsFocused} from '@react-navigation/native';
import {useEffect, useEffectEvent, useImperativeHandle, useRef, useState} from 'react';
import {Platform} from 'react-native';

import type {ReportActionsListScrollMetrics, UseReportActionsListScrollParams} from './types';

import {getReportActionItemType, getReportActionKey} from './reportActionListUtils';
import useViewportBottomAnchor from './useViewportBottomAnchor';

const PAGINATION_THRESHOLD = 0.75;

function useReportActionsListScroll({
    reportID,
    isDraftPendingCompletion,
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
    const headerSizeRef = useRef(0);

    useImperativeHandle(
        listRef,
        (): ActionListRef => ({
            getState: () => {
                const state = legendListRef.current?.getState();
                return state ? {...state, headerSize: headerSizeRef.current} : undefined;
            },
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
    const onShowPreviousMessages = () => {
        // Revealing older actions can make a short session scrollable before the requested history page arrives.
        // Follow the tail only when the reader was actually there; the action-visible threshold is much wider.
        shouldRestoreTailAfterHistoryRevealRef.current = distanceFromBottomRef.current <= 1 && !hasNewerActions;
        const shouldWaitForHistoryPage = shouldRestoreTailAfterHistoryRevealRef.current && hasOlderActions;
        oldestLoadedActionIDAtHistoryRevealRef.current = shouldWaitForHistoryPage ? oldestLoadedActionID : undefined;
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
            if (!shouldRestoreTailAfterHistoryRevealRef.current) {
                return;
            }
            legendListRef.current?.scrollToEnd({animated: false});
            const hasReceivedHistoryPage = oldestLoadedActionID !== oldestLoadedActionIDAtHistoryRevealRef.current || !hasOlderActions;
            const hasFinishedHistoryReveal =
                !oldestLoadedActionIDAtHistoryRevealRef.current || (!isLoadingOlderReportActions && (hasReceivedHistoryPage || hasLoadingOlderReportActionsError));
            if (hasFinishedHistoryReveal) {
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
        const shouldSkipExpandedActionScroll = expandedFocusIndex < 0 || viewableRowIndexesRef.current.has(expandedFocusIndex);
        if (shouldSkipExpandedActionScroll) {
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
        isActionBadgeBelowViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToLatest,
        scrollToActionBadgeTarget,
        shouldBeAlignedToTop,
        initialScrollIndex,
        initialScrollIndexParams,
        shouldShowNewerActionsSkeleton,
        shouldShowSkeletonBelowLinkedAction,
        hasRowsBelowLinkedAction,
        hideSkeletonBelowLinkedAction,
        onLoad,
        onItemSizeChanged,
        trackLinkedMessageScroll,
        stopLinkedMessagePositioning,
    } = useReportActionsScroll({
        listID,
        reportID,
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

    const isFocused = useIsFocused();
    const jumpToLatest = useEffectEvent(scrollToLatest);
    const releaseLinkedAction = useEffectEvent(stopLinkedMessagePositioning);
    const [loadedInitialViewportListID, setLoadedInitialViewportListID] = useState<string>();
    useEffect(() => {
        // Re-run once this list is ready, so the listener checks against its current scroll element.
        const shouldSkipEndKeyListener = Platform.OS !== 'web' || !isFocused || loadedInitialViewportListID !== listID;
        if (shouldSkipEndKeyListener) {
            return;
        }
        const scrollElement: unknown = legendListRef.current?.getScrollableNode();
        if (!(scrollElement instanceof HTMLElement)) {
            return;
        }
        const handleChatKey = (event: KeyboardEvent) => {
            if (shouldJumpToLatest(event, scrollElement)) {
                event.preventDefault();
                jumpToLatest();
                return;
            }
            // Browsers can page the list from a focused message or link. LegendList skips keys on those controls.
            if (!event.defaultPrevented && event.target instanceof Element && scrollElement.contains(event.target) && event.target.closest('button, a, [role="button"]')) {
                if (['PageUp', 'PageDown', 'Home', 'ArrowUp', 'ArrowDown', ' '].includes(event.key)) {
                    releaseLinkedAction();
                }
            }
        };
        // Overlay scrollbars and drag selection can move the list without a LegendList user-scroll event.
        scrollElement.addEventListener('pointerdown', releaseLinkedAction, {passive: true});
        // An empty click leaves focus on the body. Capture End before LegendList handles it on the scroller.
        document.addEventListener('keydown', handleChatKey, true);
        return () => {
            scrollElement.removeEventListener('pointerdown', releaseLinkedAction);
            document.removeEventListener('keydown', handleChatKey, true);
        };
    }, [isFocused, listID, loadedInitialViewportListID]);

    // Cover every initial LegendList layout, including cached chats, until the rows are positioned.
    // Offline reports still need their cached rows positioned, but cannot wait for OpenReport.
    const shouldShowInitialViewportSkeleton = loadedInitialViewportListID !== listID || (!isOffline && isInitialReportLoadPending);

    const readyEndListIDRef = useRef<string | undefined>(undefined);
    const {startViewportAnchor, deferScrollUntilViewportCorrected, finishViewportCorrection, preserveViewportBottom, renderScrollComponent} = useViewportBottomAnchor({
        legendListRef,
        listData,
        listID,
        shouldBeAlignedToTop,
    });
    const lastScrollMetricsRef = useRef<ReportActionsListScrollMetrics | undefined>(undefined);

    const stopFollowingEnd = () => {
        shouldRestoreTailAfterHistoryRevealRef.current = false;
    };

    const stopAutomaticPositioning = () => {
        finishViewportCorrection();
        stopLinkedMessagePositioning();
        stopFollowingEnd();
    };

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

    const markInitialViewportReady = () => {
        // onLoad only means rows rendered; keep their estimated positions covered until initial scrolling settles.
        onLoad();
        setLoadedInitialViewportListID(listID);
        readyEndListIDRef.current = listID;
        startViewportAnchor();
        lastScrollMetricsRef.current = undefined;
    };

    const loadOlderChatsOnStartReached = () => {
        const shouldSkipOlderPageRequest = showHiddenHistory || isOffline || !hasOlderActions || !oldestReportActionID || lastRequestedOldestActionIDRef.current === oldestReportActionID;
        if (shouldSkipOlderPageRequest) {
            return;
        }

        lastRequestedOldestActionIDRef.current = oldestReportActionID;
        loadOlderChats(false);
    };

    const trackScrollPositionAndThreshold = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        if (deferScrollUntilViewportCorrected(event)) {
            return;
        }
        trackLinkedMessageScroll(event);
        const {contentOffset, contentSize, layoutMeasurement} = event.nativeEvent;
        const distanceFromBottom = Math.max(0, contentSize.height - layoutMeasurement.height - contentOffset.y);
        const isNearStart = contentOffset.y <= layoutMeasurement.height * PAGINATION_THRESHOLD;
        const previousMetrics = lastScrollMetricsRef.current;
        distanceFromBottomRef.current = distanceFromBottom;
        const canFollowListEnd = readyEndListIDRef.current === listID && !hasNewerActions;
        const hasReaderMovedAwayFromEnd =
            canFollowListEnd &&
            distanceFromBottom >= CONST.REPORT.ACTIONS.AUTOSCROLL_TO_TOP_THRESHOLD &&
            !!previousMetrics &&
            (contentOffset.y < previousMetrics.offset - 1 || (previousMetrics.contentHeight === contentSize.height && previousMetrics.viewportHeight === layoutMeasurement.height));
        if (hasReaderMovedAwayFromEnd) {
            // A pending history request must not reclaim the end after the reader has moved away.
            stopFollowingEnd();
        }
        lastScrollMetricsRef.current = {offset: contentOffset.y, contentHeight: contentSize.height, viewportHeight: layoutMeasurement.height};

        if (!isNearStart) {
            lastRequestedOldestActionIDRef.current = undefined;
        } else if (readyEndListIDRef.current === listID) {
            // Before the initial scroll lands, the list still reports offsets near the top. Loading older actions then
            // inserts a page above the target while it is being positioned.
            loadOlderChatsOnStartReached();
        }

        trackVerticalScrolling(event);
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

    // The skeleton below a linked final action can keep the list end outside onEndReachedThreshold once the link sits at
    // the top, so request the newer page directly unless LegendList already did.
    const loadNewerChatsBelowLinkedAction = useEffectEvent(() => {
        if (legendListRef.current?.getState()?.isEndReached) {
            return;
        }
        loadNewerChatsAfterTransitions();
    });
    const isInitialViewportLoaded = loadedInitialViewportListID === listID;
    useEffect(() => {
        const shouldSkipLinkedPageRequest = !isInitialViewportLoaded || !shouldShowNewerActionsSkeleton;
        if (shouldSkipLinkedPageRequest) {
            return;
        }
        const frame = requestAnimationFrame(loadNewerChatsBelowLinkedAction);
        return () => cancelAnimationFrame(frame);
    }, [isInitialViewportLoaded, shouldShowNewerActionsSkeleton]);

    useFollowActionBadgeTarget({
        reportID,
        actionTargetReportActionID: actionBadgeTargetID,
        actionBadgeTargetIndex,
        renderedVisibleReportActions: listData,
        reportActionIDToDisplayIndex,
        scrollToActionBadgeTarget,
    });

    const keepViewportBottomOnResize = (event: LayoutChangeEvent) => {
        onLayout?.(event);
        if (readyEndListIDRef.current !== listID) {
            return;
        }
        const distanceFromEnd = preserveViewportBottom(event.nativeEvent.layout.height, trackScrollPositionAndThreshold);
        if (distanceFromEnd === undefined) {
            return;
        }
        scrollOffsetRef.current = distanceFromEnd;
        distanceFromBottomRef.current = distanceFromEnd;
    };

    return {
        listID,
        loadedInitialViewportListID,
        shouldShowInitialViewportSkeleton,
        shouldShowNewerActionsSkeleton,
        shouldShowSkeletonBelowLinkedAction,
        hasRowsBelowLinkedAction,
        hideSkeletonBelowLinkedAction,
        shouldBeAlignedToTop,
        onShowPreviousMessages,
        isFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        isActionBadgeBelowViewport,
        scrollToBottomAndMarkReportAsRead,
        scrollToActionBadgeTarget,
        legendListProps: {
            ref: legendListRef,
            keyExtractor: getReportActionKey,
            getItemType: getReportActionItemType,
            onEndReached: loadNewerChatsAfterTransitions,
            onEndReachedThreshold: PAGINATION_THRESHOLD,
            onLayout: keepViewportBottomOnResize,
            onScroll: trackScrollPositionAndThreshold,
            onUserScroll: stopAutomaticPositioning,
            onStartReached: loadOlderChatsOnStartReached,
            onStartReachedThreshold: PAGINATION_THRESHOLD,
            onViewableItemsChanged: updateVisibleItemOverflow,
            initialScrollAtEnd: initialScrollIndex === undefined,
            initialScrollIndex: initialScrollIndex === undefined ? undefined : {index: initialScrollIndex, ...initialScrollIndexParams},
            alignItemsAtEnd: !shouldBeAlignedToTop,
            // The new-message scroll policy sees saved actions only. Let LegendList follow the temporary
            // Concierge reply when it first appears, then keep following as its text grows.
            maintainScrollAtEnd: hasNewerActions ? false : {on: {dataAppend: isDraftPendingCompletion, itemLayout: true, footerLayout: true}},
            onReady: markInitialViewportReady,
            renderScrollComponent,
            onItemSizeChanged,
            onContentSizeChange: () => trackVerticalScrolling(undefined),
            onMetricsChange: ({headerSize}: {headerSize: number}) => {
                headerSizeRef.current = headerSize;
            },
        },
    };
}

function shouldJumpToLatest(event: KeyboardEvent, scrollElement: HTMLElement) {
    const isPlainEndKey = event.key === 'End' && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey;
    if (!isPlainEndKey || event.defaultPrevented || !(event.target instanceof Element)) {
        return false;
    }
    const target = event.target;
    const isEditable = (target instanceof HTMLElement && target.isContentEditable) || !!target.closest('input, textarea, select');
    return !isEditable && (target === document.body || scrollElement.contains(target));
}

export default useReportActionsListScroll;
