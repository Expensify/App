import type {RefObject} from 'react';
import {useCallback, useRef, useState} from 'react';
import {Platform} from 'react-native';
import {runOnJS, useAnimatedReaction} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import {readNewestAction} from '@userActions/Report';
import CONST from '@src/CONST';

type Args = {
    /** The report ID */
    reportID: string;

    /** The current offset of scrolling from either top or bottom of chat list */
    currentVerticalScrollingOffset: SharedValue<number>;

    /** The current keyboard height, updated on every keyboard movement frame */
    keyboardHeight: SharedValue<number>;

    /** Ref for whether read action was skipped */
    readActionSkippedRef: RefObject<boolean>;

    /** The initial value for visibility of floating message button */
    floatingMessageVisibleInitialValue: boolean;

    /** Whether the unread marker is displayed for any report action */
    hasUnreadMarkerReportAction: boolean;
};

export default function useReportUnreadMessageScrollTracking({
    reportID,
    currentVerticalScrollingOffset,
    floatingMessageVisibleInitialValue,
    hasUnreadMarkerReportAction,
    readActionSkippedRef,
    keyboardHeight,
}: Args) {
    const [isFloatingMessageCounterVisible, setIsFloatingMessageCounterVisible] = useState(floatingMessageVisibleInitialValue);
    const wasManuallySetRef = useRef(false);

    const setVisibility = useCallback((visible: boolean) => {
        wasManuallySetRef.current = true;
        setIsFloatingMessageCounterVisible(visible);

        requestAnimationFrame(() => {
            wasManuallySetRef.current = false;
        });
    }, []);

    /**
     * On every scroll event we want to:
     * Show/hide the new floating message counter when user is scrolling back/forth in the history of messages.
     * Call any other callback that the component might need
     */

    useAnimatedReaction(
        () => {
            return {
                offsetY: currentVerticalScrollingOffset.get(),
                kHeight: keyboardHeight.get(),
            };
        },
        ({offsetY, kHeight}) => {
            if (wasManuallySetRef.current) {
                return;
            }

            const correctedOffsetY = Platform.OS === 'ios' ? kHeight + offsetY : offsetY;

            // display floating button if we're scrolled more than the offset
            if (correctedOffsetY > CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && hasUnreadMarkerReportAction) {
                runOnJS(setIsFloatingMessageCounterVisible)(true);
            }

            // hide floating button if we're scrolled closer than the offset and mark message as read
            if (correctedOffsetY < CONST.REPORT.ACTIONS.SCROLL_VERTICAL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible) {
                if (readActionSkippedRef.current) {
                    // eslint-disable-next-line react-compiler/react-compiler,no-param-reassign
                    readActionSkippedRef.current = false;
                    runOnJS(readNewestAction)(reportID);
                }

                runOnJS(setIsFloatingMessageCounterVisible)(false);
            }
        },
    );

    return {
        isFloatingMessageCounterVisible,
        setIsFloatingMessageCounterVisible: setVisibility,
    };
}
