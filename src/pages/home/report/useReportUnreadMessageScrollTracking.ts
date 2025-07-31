import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent, ViewToken} from 'react-native';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

type Args = {
    /** The report ID */
    reportID: string;

    /** The current offset of scrolling from either top or bottom of chat list */
    currentVerticalScrollingOffsetRef: RefObject<number>;

    /** Ref for whether read action was skipped */
    readActionSkippedRef: RefObject<boolean>;

    /** The index of the unread report action */
    unreadMarkerReportActionIndex: number;

    /** Callback to call on every scroll event */
    onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export default function useReportUnreadMessageScrollTracking({reportID, currentVerticalScrollingOffsetRef, readActionSkippedRef, onTrackScrolling, unreadMarkerReportActionIndex}: Args) {
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);
    const ref = useRef({reportID, unreadMarkerReportActionIndex});
    // We want to save the updated value on ref to use it in onViewableItemsChanged
    // because FlatList requires the callback to be stable and we cannot add a dependency on the useCallback.
    useEffect(() => {
        ref.current = {reportID, unreadMarkerReportActionIndex};
    }, [reportID, unreadMarkerReportActionIndex]);

    /**
     * On every scroll event we want to:
     * Show/hide the latest message pill when user is scrolling back/forth in the history of messages.
     * Call any other callback that the component might need
     */
    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent> | undefined) => {
        if (event) {
            onTrackScrolling(event);
        }
        const hasUnreadMarkerReportAction = unreadMarkerReportActionIndex !== -1;

        // display floating button if we're scrolled more than the offset
        if (
            currentVerticalScrollingOffsetRef.current > CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD &&
            !isFloatingMessageCounterVisible &&
            !hasUnreadMarkerReportAction
        ) {
            setIsFloatingMessageCounterVisible(true);
        }

        // hide floating button if we're scrolled closer than the offset
        if (
            currentVerticalScrollingOffsetRef.current < CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD &&
            isFloatingMessageCounterVisible &&
            !hasUnreadMarkerReportAction
        ) {
            setIsFloatingMessageCounterVisible(false);
        }
    };

    const onViewableItemsChanged = useCallback(({viewableItems}: {viewableItems: ViewToken[]; changed: ViewToken[]}) => {
        const viewableIndexes = viewableItems.map((viewableItem) => viewableItem.index).filter((value) => typeof value === 'number') as number[];
        const maxIndex = Math.max(...viewableIndexes);
        const minIndex = Math.min(...viewableIndexes);
        const unreadActionIndex = ref.current.unreadMarkerReportActionIndex;
        const hasUnreadMarkerReportAction = unreadActionIndex !== -1;
        const unreadActionVisible = unreadActionIndex >= minIndex && unreadActionIndex <= maxIndex;

        // display floating button if the unread report action is out of view
        if (!unreadActionVisible && hasUnreadMarkerReportAction) {
            setIsFloatingMessageCounterVisible(true);
        }
        // hide floating button if the unread report action becomes visible
        if (unreadActionVisible && hasUnreadMarkerReportAction) {
            setIsFloatingMessageCounterVisible(false);
        }

        // if we're scrolled closer than the offset and read action has been skipped then mark message as read
        if (unreadActionVisible && readActionSkippedRef.current) {
            // eslint-disable-next-line react-compiler/react-compiler,no-param-reassign
            readActionSkippedRef.current = false;
            readNewestAction(ref.current.reportID);
        }

        // FlatList requires onViewableItemsChanged callback to be stable so we can't have a dependency.
        // eslint-disable-next-line react-compiler/react-compiler
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return {
        isFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible,
        trackVerticalScrolling,
        onViewableItemsChanged,
    };
}
