import type {RefObject} from 'react';
import {useState} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

type Args = {
    /** The report ID */
    reportID: string;

    /** The current offset of scrolling from either top or bottom of chat list */
    currentVerticalScrollingOffsetRef: RefObject<number>;

    /** Ref for whether read action was skipped */
    readActionSkippedRef: RefObject<boolean>;

    /** The initial value for visibility of floating message button */
    floatingMessageVisibleInitialValue: boolean;

    /** Whether the unread marker is displayed for any report action */
    hasUnreadMarkerReportAction: boolean;

    /** Whether the report has newer actions to load */
    hasNewerActions: boolean;

    /** Callback to call on every scroll event */
    onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export default function useReportUnreadMessageScrollTracking({
    reportID,
    currentVerticalScrollingOffsetRef,
    floatingMessageVisibleInitialValue,
    hasUnreadMarkerReportAction,
    hasNewerActions,
    readActionSkippedRef,
    onTrackScrolling,
}: Args) {
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(floatingMessageVisibleInitialValue);

    /**
     * On every scroll event we want to:
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     * Call any other callback that the component might need
     */
    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent> | undefined) => {
        if (event) {
            onTrackScrolling(event);
        }

        const isScrolledToEnd = currentVerticalScrollingOffsetRef.current <= CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD;

        // When we have an unread message, display floating button if we're scrolled more than the offset
        if (hasUnreadMarkerReportAction && !isScrolledToEnd && !isFloatingMessageCounterVisible) {
            setIsFloatingMessageCounterVisible(true);
        }

        // hide floating button if we're scrolled closer than the offset and mark message as read
        if (isScrolledToEnd && !hasNewerActions && isFloatingMessageCounterVisible) {
            if (readActionSkippedRef.current) {
                // eslint-disable-next-line react-compiler/react-compiler,no-param-reassign
                readActionSkippedRef.current = false;
                readNewestAction(reportID);
            }

            setIsFloatingMessageCounterVisible(false);
        }
    };

    return {
        isFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible,
        trackVerticalScrolling,
    };
}
