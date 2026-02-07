import {useIsFocused} from '@react-navigation/native';
import {useCallback, useEffect, useRef, useState} from 'react';
import type {RefObject} from 'react';
import type {ViewToken} from 'react-native';
import {useAnimatedReaction} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {readNewestAction} from '@userActions/Report';
import floatingMessageCounterVisibilityHandler from './floatingMessageCounterVisibilityHandler';

type Args = {
    /** The report ID */
    reportID: string;

    /** Whether the FlatList is inverted, we need it to determine if the current unread message is visible. */
    isInverted: boolean;

    /** The current offset of scrolling from either top or bottom of chat list */
    currentVerticalScrollingOffset: SharedValue<number>;

    /** The current keyboard height, updated on every keyboard movement frame */
    keyboardHeight: SharedValue<number>;

    /** Ref for whether read action was skipped */
    readActionSkippedRef: RefObject<boolean>;

    /** The index of the unread report action */
    unreadMarkerReportActionIndex: number;

    /** Whether the unread marker is displayed for any report action */
    hasUnreadMarkerReportAction: boolean;
};

export default function useReportUnreadMessageScrollTracking({
    reportID,
    readActionSkippedRef,
    unreadMarkerReportActionIndex,
    isInverted,
    currentVerticalScrollingOffset,
    keyboardHeight,
}: Args) {
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(false);
    const isFocused = useIsFocused();
    const ref = useRef<{previousViewableItems: ViewToken[]; reportID: string; unreadMarkerReportActionIndex: number; isFocused: boolean}>({
        reportID,
        unreadMarkerReportActionIndex,
        previousViewableItems: [],
        isFocused: true,
    });
    const wasManuallySetRef = useRef(false);

    const updateFloatingMessageCounterVisibility = useCallback((visible: boolean) => {
        wasManuallySetRef.current = true;
        setIsFloatingMessageCounterVisible(visible);

        requestAnimationFrame(() => {
            wasManuallySetRef.current = false;
        });
    }, []);

    // We want to save the updated value on ref to use it in onViewableItemsChanged
    // because FlatList requires the callback to be stable and we cannot add a dependency on the useCallback.
    useEffect(() => {
        ref.current.reportID = reportID;
        ref.current.previousViewableItems = [];
    }, [reportID]);

    useEffect(() => {
        ref.current.isFocused = isFocused;
    }, [isFocused]);

    /**
     * On every scroll event we want to:
     * Show/hide the latest message pill when user is scrolling back/forth in the history of messages.
     * Call any other callback that the component might need
     */

    useAnimatedReaction(
        () => {
            return {
                offsetY: currentVerticalScrollingOffset.get(),
                kHeight: keyboardHeight.get(),
            };
        },
        ({offsetY, kHeight}) =>
            floatingMessageCounterVisibilityHandler({
                isFloatingMessageCounterVisible,
                kHeight,
                offsetY,
                setIsFloatingMessageCounterVisible,
                unreadMarkerReportActionIndex,
                wasManuallySetRef,
            }),
        [isFloatingMessageCounterVisible, reportID, readActionSkippedRef, unreadMarkerReportActionIndex],
    );

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

        // if we're scrolled closer than the offset and read action has been skipped then mark message as read
        if (unreadActionVisible && readActionSkippedRef.current) {
            // eslint-disable-next-line no-param-reassign
            readActionSkippedRef.current = false;
            readNewestAction(ref.current.reportID);
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

    return {
        isFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible: updateFloatingMessageCounterVisibility,
        onViewableItemsChanged,
    };
}
