import CONST from '@src/CONST';

import type {RefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';

import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';

type Args = {
    /** The report ID */
    reportID: string;

    /** Whether the FlatList is inverted, we need it to determine if the current unread message is visible. */
    isInverted: boolean;

    /** The current offset of scrolling from either top or bottom of chat list */
    currentVerticalScrollingOffsetRef: RefObject<number>;

    /** Called when the unread-marker action is within the viewport, on every viewability change */
    onUnreadActionVisible: () => void;

    /** The index of the unread report action */
    unreadMarkerReportActionIndex: number;

    /** Whether the report has newer actions to load */
    hasNewerActions: boolean;

    /** Callback to call on every scroll event */
    onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;

    /** The index of the action badge target report action in the sorted visible actions list (-1 if none) */
    actionBadgeTargetIndex?: number;

    /** Whether the report is aligned to the top. When true, the "Latest messages" pill should never be shown. */
    shouldBeAlignedToTop?: boolean;

    /** If pill tracking should be disabled, used during initial linked message positioning */
    shouldDisablePillTracking?: boolean;
};

export default function useReportUnreadMessageScrollTracking({
    reportID,
    currentVerticalScrollingOffsetRef,
    hasNewerActions,
    onUnreadActionVisible,
    onTrackScrolling,
    unreadMarkerReportActionIndex,
    isInverted,
    actionBadgeTargetIndex = -1,
    shouldBeAlignedToTop = false,
    shouldDisablePillTracking = false,
}: Args) {
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);
    const [isActionBadgeAboveViewport, setIsActionBadgeAboveViewport] = useState(false);
    const isFocused = useIsFocused();
    const ref = useRef<{
        previousViewableItems: ViewToken[];
        reportID: string;
        unreadMarkerReportActionIndex: number;
        isFocused: boolean;
        onUnreadActionVisible: () => void;
        actionBadgeTargetIndex: number;
    }>({
        reportID,
        unreadMarkerReportActionIndex,
        previousViewableItems: [],
        isFocused: true,
        onUnreadActionVisible,
        actionBadgeTargetIndex,
    });
    // We want to save the updated value on ref to use it in onViewableItemsChanged
    // because FlatList requires the callback to be stable and we cannot add a dependency on the useCallback.
    useEffect(() => {
        ref.current.reportID = reportID;
        ref.current.previousViewableItems = [];
    }, [reportID]);

    useEffect(() => {
        ref.current.isFocused = isFocused;
    }, [isFocused]);

    useEffect(() => {
        ref.current.onUnreadActionVisible = onUnreadActionVisible;
    }, [onUnreadActionVisible]);

    /**
     * Show/hide the latest message pill when user is scrolling back/forth in the history of messages.
     */
    const updatePillVisibility = () => {
        const hasUnreadMarkerReportAction = unreadMarkerReportActionIndex !== -1;

        // display floating button if we're scrolled more than the offset
        if (
            currentVerticalScrollingOffsetRef.current > CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD &&
            !isFloatingMessageCounterVisible &&
            !hasUnreadMarkerReportAction &&
            !shouldBeAlignedToTop
        ) {
            setIsFloatingMessageCounterVisible(true);
        }

        // hide floating button if we're scrolled closer than the offset
        if (
            currentVerticalScrollingOffsetRef.current < CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD &&
            isFloatingMessageCounterVisible &&
            !hasUnreadMarkerReportAction &&
            !hasNewerActions
        ) {
            setIsFloatingMessageCounterVisible(false);
        }
    };

    /**
     * On every scroll event we want to:
     * Update the current scroll offset ref
     * Show/hide the latest message pill, if it's not disabled
     */
    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent> | undefined) => {
        if (event) {
            onTrackScrolling(event);
        }

        if (shouldDisablePillTracking) {
            return;
        }

        updatePillVisibility();
    };

    const onViewableItemsChanged = useCallback(({viewableItems}: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        if (!ref.current.isFocused) {
            return;
        }

        ref.current.previousViewableItems = viewableItems;
        const viewableIndexes = viewableItems.map((viewableItem) => viewableItem.index).filter((value) => typeof value === 'number');

        if (viewableIndexes.length === 0) {
            return;
        }

        const maxIndex = Math.max(...viewableIndexes);
        const minIndex = Math.min(...viewableIndexes);
        const unreadActionIndex = ref.current.unreadMarkerReportActionIndex;
        const hasUnreadMarkerReportAction = unreadActionIndex !== -1;
        const unreadActionVisible = isInverted ? unreadActionIndex >= minIndex : unreadActionIndex <= maxIndex;

        // display floating button if the unread report action is out of view
        if (!unreadActionVisible && hasUnreadMarkerReportAction) {
            setIsFloatingMessageCounterVisible(true);
        }
        // hide floating button if the unread report action becomes visible
        if (unreadActionVisible && hasUnreadMarkerReportAction) {
            setIsFloatingMessageCounterVisible(false);
        }

        // when the unread action scrolls into view, the consumer decides whether a skipped mark-as-read needs completing
        if (hasUnreadMarkerReportAction && unreadActionVisible) {
            ref.current.onUnreadActionVisible();
        }

        // Track whether the action badge target is above the viewport (i.e., not visible and at a higher index in the inverted list)
        const badgeTargetIndex = ref.current.actionBadgeTargetIndex;
        if (badgeTargetIndex !== -1) {
            // In an inverted list, higher indexes are "above" (older messages). The target is above the viewport
            // when its index is greater than the max visible index.
            const isAbove = isInverted ? badgeTargetIndex > maxIndex : badgeTargetIndex < minIndex;
            setIsActionBadgeAboveViewport(isAbove);
        } else {
            setIsActionBadgeAboveViewport(false);
        }

        // FlatList requires a stable onViewableItemsChanged callback for optimal performance.
        // Therefore, we use a ref to store values instead of adding them as dependencies.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // When unreadMarkerReportActionIndex changes we will manually call onViewableItemsChanged with previousViewableItems to recalculate
    // the state of floating button because onViewableItemsChanged on  FlatList will only be called when viewable items change.
    useEffect(() => {
        ref.current.unreadMarkerReportActionIndex = unreadMarkerReportActionIndex;

        if (ref.current.previousViewableItems.length) {
            onViewableItemsChanged({viewableItems: ref.current.previousViewableItems, changed: []});
        }
    }, [onViewableItemsChanged, unreadMarkerReportActionIndex]);

    // When actionBadgeTargetIndex changes, recalculate visibility
    useEffect(() => {
        ref.current.actionBadgeTargetIndex = actionBadgeTargetIndex;
        onViewableItemsChanged({viewableItems: ref.current.previousViewableItems, changed: []});
    }, [onViewableItemsChanged, actionBadgeTargetIndex]);

    return {
        isFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible,
        isActionBadgeAboveViewport,
        trackVerticalScrolling,
        onViewableItemsChanged,
        updatePillVisibility,
    };
}
