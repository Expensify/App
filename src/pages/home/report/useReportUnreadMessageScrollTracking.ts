import {useState} from 'react';
import type {MutableRefObject} from 'react';
import type {NativeScrollEvent, NativeSyntheticEvent} from 'react-native';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

type Args = {
    /** The report ID */
    reportID: string;

    /** The current offset of scrolling from either top or bottom of chat list */
    currentVerticalScrollingOffsetRef: MutableRefObject<number>;

    /** Ref for whether read action was skipped */
    readActionSkippedRef: MutableRefObject<boolean>;

    /** The initial value for visibility of floating message button */
    floatingMessageVisibleInitialValue: boolean;

    /** Whether the unread marker is displayed for any report action */
    hasUnreadMarkerReportAction: boolean;

    /** Callback to call on every scroll event */
    onTrackScrolling: (event: NativeSyntheticEvent<NativeScrollEvent>) => void;
};

export default function useReportUnreadMessageScrollTracking({
    reportID,
    currentVerticalScrollingOffsetRef,
    floatingMessageVisibleInitialValue,
    hasUnreadMarkerReportAction,
    readActionSkippedRef,
    onTrackScrolling,
}: Args) {
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(floatingMessageVisibleInitialValue);

    /**
     * On every scroll event we want to:
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     * Call any other callback that the component might need
     */
    const trackVerticalScrolling = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        onTrackScrolling(event);

        // display floating button if we're scrolled more than the offset
        if (currentVerticalScrollingOffsetRef.current > CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && hasUnreadMarkerReportAction) {
            setIsFloatingMessageCounterVisible(true);
        }

        // hide floating button if we're scrolled closer than the offset and mark message as read
        if (currentVerticalScrollingOffsetRef.current < CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
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
