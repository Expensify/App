import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';
import useReportScrollManager from '@hooks/useReportScrollManager';
import useScrollToEndOnNewMessageReceived from '@hooks/useScrollToEndOnNewMessageReceived';

import TransitionTracker from '@libs/Navigation/TransitionTracker';

import {useActionListContext} from '@pages/inbox/ActionListContext';
import {useAgentZeroStatus} from '@pages/inbox/AgentZeroStatusContext';
import useReportUnreadMessageScrollTracking from '@pages/inbox/report/useReportUnreadMessageScrollTracking';

import {openReport} from '@userActions/Report';
import {subscribeToNewActionEvent} from '@userActions/Report/reportActionSubscribers';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';

import type {LayoutChangeEvent, NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';

import {guidedSetupAndTourStatusSelector} from '@selectors/Onboarding';
import {useEffect, useEffectEvent, useRef} from 'react';

// Amount of time to wait until all list items should be rendered and scrollToEnd will behave well
const DELAY_FOR_SCROLLING_TO_END = 100;

// How long to keep pinning the list to the bottom after "Latest messages", long enough for deferred content to
// settle. Past that, an unrelated layout change shouldn't yank the user back down.
const STICK_TO_BOTTOM_DURATION_MS = 2000;

type UseMoneyRequestReportScrollParams = {
    reportID: string | undefined;

    /** Whether the report's list is aligned to the top instead of the bottom */
    shouldBeAlignedToTop: boolean;

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

    /** Tells the caller whether the list is scrolled further from the bottom than the action-visible threshold */
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

    /** "Latest messages" pill click handler. Scrolls to the bottom and marks the report as read once it lands */
    scrollToLatestMessages: () => void;

    /** Jumps the list to its last item, the way action items reach the newest message */
    scrollToBottom: () => void;

    /** FlashList onContentSizeChange handler. Refreshes the bottom offset and keeps the list pinned while stick-to-bottom is active */
    onListContentSizeChange: (width: number, height: number) => void;

    /** List onLayout handler. Refreshes the bottom offset from the laid-out list height */
    onListLayout: (event: LayoutChangeEvent) => void;

    /** FlashList onScrollBeginDrag handler. Cancels stick-to-bottom and any pending mark-as-read */
    onListScrollBeginDrag: () => void;

    /** Receives the unified list's last item index */
    updateLastItemIndex: (index: number) => void;
};

/**
 * Owns the scroll behavior of the money-request report view's unified list: bottom-offset tracking, the "Latest
 * messages" pill, scroll-to-bottom on own/new messages, stick-to-bottom while deferred content settles, and the
 * AgentZero thinking-indicator reveal.
 *
 * Unlike the chat list, this list is not inverted. Everything here is bottom-offset math over a normal list.
 */
function useMoneyRequestReportScroll({
    reportID,
    shouldBeAlignedToTop,
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
    const [guidedSetupAndTourStatus] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: guidedSetupAndTourStatusSelector});

    // The unified list reports its last item index through updateLastItemIndex
    const lastItemIndexRef = useRef(0);
    const updateLastItemIndex = (index: number) => {
        lastItemIndexRef.current = index;
    };

    // scrollToEnd targets an estimated content-end offset, which on a list this large leaves the bottom blank until
    // it renders and corrects. scrollToIndex targets the last item and renders around it, so the landing is never blank.
    const scrollToBottom = () => {
        if (lastItemIndexRef.current < 0) {
            return;
        }

        reportScrollManager.scrollToIndex(lastItemIndexRef.current, {animated: false, viewPosition: 1});
    };

    const listLayoutHeightRef = useRef(0);
    const listContentHeightRef = useRef(0);
    const listScrollYRef = useRef(0);
    const scrollingVerticalBottomOffset = useRef(0);

    const syncBottomOffset = () => {
        const bottomOffset = listContentHeightRef.current - listLayoutHeightRef.current - listScrollYRef.current;
        scrollingVerticalBottomOffset.current = bottomOffset;
        scrollOffsetRef.current = bottomOffset;
        onScrolledOverThresholdChange(bottomOffset >= CONST.REPORT.ACTIONS.ACTION_VISIBLE_THRESHOLD);
    };

    const stickToBottomRef = useRef(false);
    const stickToBottomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    // Set when the user taps "Latest messages", cleared once the scroll reaches the bottom or the user scrolls away
    const pendingMarkAsReadRef = useRef(false);

    const {isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible, trackVerticalScrolling, onViewableItemsChanged} = useReportUnreadMessageScrollTracking({
        reportID: resetKey,
        currentVerticalScrollingOffsetRef: scrollingVerticalBottomOffset,
        onUnreadActionVisible: completeSkippedMarkAsRead,
        unreadMarkerReportActionIndex,
        isInverted: false,
        hasNewerActions,
        shouldBeAlignedToTop,
        onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => {
            const {layoutMeasurement, contentSize, contentOffset} = event.nativeEvent;
            listContentHeightRef.current = contentSize.height;
            listLayoutHeightRef.current = layoutMeasurement.height;
            listScrollYRef.current = contentOffset.y;
            syncBottomOffset();

            // The jump fired by "Latest messages" settles over several frames as deferred items hydrate, so the
            // report is marked as read only once the scroll really lands here.
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

    // The indicator renders in the list footer, below the row scrollToBottom targets, so only scrollToEnd reveals it
    const {candidateAgentIDs} = useAgentZeroStatus();
    const isThinkingIndicatorVisible = candidateAgentIDs.length > 0;
    // Scroll once per appearance, because the label changes many times per run and re-firing would yank the viewport
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

        // Wait for the footer to lay out, otherwise there is nothing to scroll to yet
        const timeoutID = setTimeout(() => {
            reportScrollManager.scrollToEnd();
        }, DELAY_FOR_SCROLLING_TO_END);

        return () => clearTimeout(timeoutID);
    }, [isThinkingIndicatorVisible, reportScrollManager]);

    // When the just-sent action hasn't landed in the visible data yet, remember it and scroll once it does
    const pendingScrollToActionIDRef = useRef<string | null>(null);
    const ownActionScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Effect Event so the Pusher subscription below can subscribe once per report and still read the latest actions
    const onNewActionEvent = useEffectEvent((isFromCurrentUser: boolean, reportAction?: OnyxTypes.ReportAction) => {
        TransitionTracker.runAfterTransitions({
            callback: () => {
                setIsFloatingMessageCounterVisible(false);
                // If a new comment is added from the current user, scroll to the bottom, otherwise leave the user position unchanged
                if (!isFromCurrentUser || reportAction?.actionName !== CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT) {
                    return;
                }

                // Delay so the just-sent item has landed in the data before we jump
                const index = visibleReportActions.findIndex((item) => item.reportActionID === reportAction?.reportActionID);
                if (index !== -1) {
                    if (ownActionScrollTimeoutRef.current) {
                        clearTimeout(ownActionScrollTimeoutRef.current);
                    }
                    ownActionScrollTimeoutRef.current = setTimeout(() => {
                        ownActionScrollTimeoutRef.current = null;
                        scrollToBottom();
                    }, DELAY_FOR_SCROLLING_TO_END);
                } else {
                    pendingScrollToActionIDRef.current = reportAction?.reportActionID ?? null;
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

    // No per-run cleanup on purpose. Cancelling the pending jump whenever another action lands is what stops the
    // list from ever reaching the newest message.
    const pendingScrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    useEffect(() => {
        const pendingActionID = pendingScrollToActionIDRef.current;
        if (!pendingActionID) {
            return;
        }
        const index = visibleReportActions.findIndex((item) => item.reportActionID === pendingActionID);
        if (index === -1) {
            return;
        }
        pendingScrollToActionIDRef.current = null;
        if (pendingScrollTimeoutRef.current) {
            clearTimeout(pendingScrollTimeoutRef.current);
        }
        pendingScrollTimeoutRef.current = setTimeout(() => {
            pendingScrollTimeoutRef.current = null;
            scrollToBottom();
        }, DELAY_FOR_SCROLLING_TO_END);
    }, [visibleReportActions, scrollToBottom]);

    const scrollToLatestMessages = () => {
        setIsFloatingMessageCounterVisible(false);

        stickToBottomRef.current = true;
        if (stickToBottomTimeoutRef.current) {
            clearTimeout(stickToBottomTimeoutRef.current);
        }
        stickToBottomTimeoutRef.current = setTimeout(() => {
            stickToBottomRef.current = false;
        }, STICK_TO_BOTTOM_DURATION_MS);

        if (!hasNewestReportAction) {
            openReport({
                reportID,
                introSelected,
                conciergeChat,
                betas,
                hasReportActions: true,
                currentUserAccountID,
                isSelfTourViewed: guidedSetupAndTourStatus?.isSelfTourViewed,
                hasCompletedGuidedSetupFlow: guidedSetupAndTourStatus?.hasCompletedGuidedSetupFlow,
            });
            scrollToBottom();
            return;
        }

        // Defer marking the report as read until the scroll actually reaches the bottom (handled in onTrackScrolling).
        pendingMarkAsReadRef.current = true;
        scrollToBottom();
    };

    useEffect(() => {
        return () => {
            for (const timeoutRef of [stickToBottomTimeoutRef, pendingScrollTimeoutRef, ownActionScrollTimeoutRef]) {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            }
        };
    }, []);

    const onListContentSizeChange = (_width: number, height: number) => {
        listContentHeightRef.current = height;
        syncBottomOffset();

        if (!stickToBottomRef.current) {
            return;
        }
        scrollToBottom();
    };

    const onListLayout = (event: LayoutChangeEvent) => {
        listLayoutHeightRef.current = event.nativeEvent.layout.height;
        syncBottomOffset();
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
        onListLayout,
        onListScrollBeginDrag,
        updateLastItemIndex,
        scrollToBottom,
    };
}

export default useMoneyRequestReportScroll;
