import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useActionListContext} from '@pages/inbox/ActionListContext';
import {useAgentZeroStatus} from '@pages/inbox/AgentZeroStatusContext';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';

import {openReport, subscribeToNewActionEvent} from '@userActions/Report';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';

import {useEffect, useEffectEvent, useRef, useState} from 'react';

// Amount of time to wait until all list items should be rendered and scrollToEnd will behave well
const DELAY_FOR_SCROLLING_TO_END = 100;

type UseMoneyRequestReportScrollParams = {
    /** The report whose list is being scrolled */
    reportID: string | undefined;

    /** Key that resets the new-message autoscroll tracking, usually the reportID */
    resetKey: string;

    /** Actions rendered in the unified list, oldest-first */
    visibleReportActions: OnyxTypes.ReportAction[];

    /** Number of paginated report actions (pre-filter) */
    reportActionsLength: number;

    /** The newest visible action */
    lastAction: OnyxTypes.ReportAction | undefined;

    /** Whether the newest report action is already loaded */
    hasNewestReportAction: boolean;

    /** Whether newer actions exist beyond the loaded page */
    hasNewerActions: boolean;

    /** Index of the unread marker within the rendered (oldest-first) actions, or -1 */
    unreadMarkerReportActionIndex: number;

    /** Reports whether the list is scrolled further from the bottom than the action-visible threshold */
    onScrolledOverThresholdChange: (isScrolledOverThreshold: boolean) => void;

    /** Marks the newest action as read (from `useMarkAsRead`) */
    markNewestActionAsRead: () => void;

    /** Completes a previously skipped mark-as-read (from `useMarkAsRead`) */
    completeSkippedMarkAsRead: () => void;
};

type UseMoneyRequestReportScrollResult = {
    /** Whether the "Latest messages" pill should show */
    isFloatingMessageCounterVisible: boolean;

    /** FlashList onScroll handler */
    trackVerticalScrolling: (event: NativeSyntheticEvent<NativeScrollEvent> | undefined) => void;

    /** FlashList onViewableItemsChanged handler */
    onViewableItemsChanged: (info: {viewableItems: ViewToken[]; changed: ViewToken[]}) => void;

    /** "Latest messages" pill click handler — scrolls to the bottom and marks the report as read once it lands */
    scrollToLatestMessages: () => void;

    /** FlashList onContentSizeChange handler — keeps the list pinned to the bottom while stick-to-bottom is active */
    onListContentSizeChange: () => void;

    /** FlashList onScrollBeginDrag handler — cancels stick-to-bottom and any pending mark-as-read */
    onListScrollBeginDrag: () => void;

    /** Receives the unified list's last item index so scroll-to-bottom can target it via scrollToIndex */
    updateLastItemIndex: (index: number) => void;
};

/**
 * Owns the scroll behavior of the money-request report view's unified list: bottom-offset tracking,
 * the "Latest messages" pill, scroll-to-bottom on own/new messages, stick-to-bottom while deferred
 * content settles, and the AgentZero thinking-indicator reveal.
 *
 * Unlike the chat list this list is NOT inverted (data is oldest-first) — the scroll model is
 * bottom-offset math over a normal list, and jumping to the newest message goes through
 * scrollToIndex on the last item rather than scrollToEnd (see `scrollToBottom`).
 */
function useMoneyRequestReportScroll({
    reportID,
    resetKey,
    visibleReportActions,
    reportActionsLength,
    lastAction,
    hasNewestReportAction,
    hasNewerActions,
    unreadMarkerReportActionIndex,
    onScrolledOverThresholdChange,
    markNewestActionAsRead,
    completeSkippedMarkAsRead,
}: UseMoneyRequestReportScrollParams): UseMoneyRequestReportScrollResult {
    const reportScrollManager = useReportScrollManager();
    const {scrollOffsetRef} = useActionListContext();
    const {accountID: currentUserAccountID} = useCurrentUserPersonalDetails();
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);

    // The unified list writes its last item index here (see updateLastItemIndex). We jump to the bottom via
    // scrollToIndex rather than scrollToEnd: scrollToEnd targets an estimated content-end offset, which on a large
    // list (hundreds of transactions + chat) leaves the bottom blank until it renders/corrects. scrollToIndex
    // targets the last item directly and renders around it, so the landing is not blank.
    const lastItemIndexRef = useRef(0);
    const updateLastItemIndex = (index: number) => {
        lastItemIndexRef.current = index;
    };

    const scrollToBottom = () => {
        if (lastItemIndexRef.current < 0) {
            return;
        }

        reportScrollManager.scrollToIndex(lastItemIndexRef.current, {animated: false, viewPosition: 1});
    };

    const scrollingVerticalBottomOffset = useRef(0);
    const stickToBottomRef = useRef(false);
    const stickToBottomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Set when the user taps "Latest messages"; the report is marked as read only once the scroll actually reaches the bottom.
    const pendingMarkAsReadRef = useRef(false);

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged} = useReportUnreadMessageScrollTracking({
        reportID: resetKey,
        currentVerticalScrollingOffsetRef: scrollingVerticalBottomOffset,
        onUnreadActionVisible: completeSkippedMarkAsRead,
        unreadMarkerReportActionIndex,
        isInverted: false,
        hasNewerActions,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const {layoutMeasurement, contentSize, contentOffset} = event.nativeEvent;
            const fullContentHeight = contentSize.height;

            /**
             * Count the diff between current scroll position and the bottom of the list.
             * Diff == (height of all items in the list) - (height of the layout with the list) - (how far user scrolled)
             */
            scrollingVerticalBottomOffset.current = fullContentHeight - layoutMeasurement.height - contentOffset.y;
            scrollOffsetRef.current = scrollingVerticalBottomOffset.current;
            onScrolledOverThresholdChange(scrollingVerticalBottomOffset.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);

            // Mark the report as read only once the scroll has actually reached the bottom. The jump fired by
            // "Latest messages" settles over several frames as deferred items hydrate, so we wait for the real end.
            if (pendingMarkAsReadRef.current && scrollingVerticalBottomOffset.current < CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD) {
                pendingMarkAsReadRef.current = false;
                markNewestActionAsRead();
            }
        },
    });

    useScrollToEndOnNewMessageReceived({
        sizeChangeType: 'grewFromReportActions',
        scrollOffsetRef,
        lastActionID: lastAction?.reportActionID,
        visibleActionsLength: visibleReportActions.length,
        reportActionsLength,
        hasNewestReportAction,
        setIsFloatingMessageCounterVisible,
        scrollToEnd: scrollToBottom,
        resetKey,
    });

    // The indicator renders in the list footer, below the row scrollToBottom targets, so only
    // scrollToEnd reveals it. This list is not inverted, so nothing sticks to the bottom for us.
    const {candidateAgentIDs} = useAgentZeroStatus();
    const isThinkingIndicatorVisible = candidateAgentIDs.length > 0;
    // Scroll once per appearance: the label changes many times per run, and re-firing would yank
    // the viewport away from a user who has since scrolled up.
    const hasScrolledForThinkingIndicatorRef = useRef(false);
    useEffect(() => {
        if (!isThinkingIndicatorVisible) {
            hasScrolledForThinkingIndicatorRef.current = false;
            return;
        }
        if (hasScrolledForThinkingIndicatorRef.current || scrollingVerticalBottomOffset.current >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD) {
            return;
        }
        hasScrolledForThinkingIndicatorRef.current = true;

        // Wait for the footer to lay out, otherwise the content hasn't grown yet and there is
        // nothing to scroll to.
        const timeoutID = setTimeout(() => {
            reportScrollManager.scrollToEnd();
        }, DELAY_FOR_SCROLLING_TO_END);

        return () => clearTimeout(timeoutID);
    }, [isThinkingIndicatorVisible, reportScrollManager]);

    // When the just-sent action hasn't landed in the visible data yet, remember it and scroll once it does.
    const [pendingScrollToActionID, setPendingScrollToActionID] = useState<string | null>(null);

    // Effect Event so the Pusher subscription below can stay subscribed once per report while still
    // reading the latest visible actions.
    const onNewActionEvent = useEffectEvent((isFromCurrentUser: boolean, reportAction?: OnyxTypes.ReportAction) => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                setIsFloatingMessageCounterVisible(false);
                // If a new comment is added from the current user, scroll to the bottom, otherwise leave the user position unchanged
                if (!isFromCurrentUser || reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
                    return;
                }

                // We want to scroll to the end of the list where the newest message is. We route through the indexed
                // scrollToBottom (scrollToIndex) rather than scrollToEnd because scrollToEnd targets an estimated
                // content-end offset that leaves the bottom blank on large transaction+chat lists. We still delay so
                // the just-sent item has landed in the data before we jump.
                const index = visibleReportActions.findIndex((item) => item.reportActionID === reportAction?.reportActionID);
                if (index !== -1) {
                    setTimeout(() => {
                        scrollToBottom();
                    }, DELAY_FOR_SCROLLING_TO_END);
                } else {
                    setPendingScrollToActionID(reportAction?.reportActionID ?? null);
                }
            },
        });
    });

    useEffect(() => {
        if (!reportID) {
            return;
        }
        // This callback is triggered when a new action arrives via Pusher and the event is emitted from Report.ts. This allows us to maintain
        // a single source of truth for the "new action" event instead of trying to derive that a new action has appeared from looking at props.
        const unsubscribe = subscribeToNewActionEvent(reportID, onNewActionEvent);

        return () => {
            unsubscribe?.();
        };
    }, [reportID]);

    useEffect(() => {
        if (!pendingScrollToActionID) {
            return;
        }
        const index = visibleReportActions.findIndex((item) => item.reportActionID === pendingScrollToActionID);
        if (index === -1) {
            return;
        }
        const timeoutID = setTimeout(() => {
            scrollToBottom();
            setPendingScrollToActionID(null);
        }, DELAY_FOR_SCROLLING_TO_END);

        return () => clearTimeout(timeoutID);
    }, [pendingScrollToActionID, visibleReportActions, scrollToBottom]);

    const scrollToLatestMessages = () => {
        setIsFloatingMessageCounterVisible(false);

        stickToBottomRef.current = true;
        if (stickToBottomTimeoutRef.current) {
            clearTimeout(stickToBottomTimeoutRef.current);
        }
        // Safety net: stop pinning after deferred content has had time to settle, so a much later
        // unrelated layout change doesn't yank the user back down.
        stickToBottomTimeoutRef.current = setTimeout(() => {
            stickToBottomRef.current = false;
        }, 2000);

        if (!hasNewestReportAction) {
            openReport({reportID, introSelected, conciergeChat, betas, hasReportActions: true, currentUserAccountID});
            scrollToBottom();
            return;
        }

        // Defer marking the report as read until the scroll actually reaches the bottom (handled in onTrackScrolling).
        pendingMarkAsReadRef.current = true;
        scrollToBottom();
    };

    useEffect(() => {
        return () => {
            if (!stickToBottomTimeoutRef.current) {
                return;
            }
            clearTimeout(stickToBottomTimeoutRef.current);
        };
    }, []);

    const onListContentSizeChange = () => {
        if (!stickToBottomRef.current) {
            return;
        }
        scrollToBottom();
    };

    const onListScrollBeginDrag = () => {
        stickToBottomRef.current = false;
        // The user scrolled away before reaching the bottom, so cancel the pending read.
        pendingMarkAsReadRef.current = false;
        if (stickToBottomTimeoutRef.current) {
            clearTimeout(stickToBottomTimeoutRef.current);
            stickToBottomTimeoutRef.current = null;
        }
    };

    return {
        isFloatingMessageCounterVisible,
        trackVerticalScrolling,
        onViewableItemsChanged,
        scrollToLatestMessages,
        onListContentSizeChange,
        onListScrollBeginDrag,
        updateLastItemIndex,
    };
}

export default useMoneyRequestReportScroll;
