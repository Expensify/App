import {runOnJS} from 'react-native-reanimated';
import CONST from '@src/CONST';
import type FloatingMessageCounterVisibilityHandlerParams from './types';

function floatingMessageCounterVisibilityHandler({
    wasManuallySetRef,
    isFloatingMessageCounterVisible,
    offsetY,
    kHeight,
    setIsFloatingMessageCounterVisible,
    unreadMarkerReportActionIndex,
}: FloatingMessageCounterVisibilityHandlerParams) {
    'worklet';

    if (wasManuallySetRef.current) {
        return;
    }

    const correctedOffsetY = kHeight + offsetY;

    const hasUnreadMarkerReportAction = unreadMarkerReportActionIndex !== -1;

    // display floating button if we're scrolled more than the offset
    if (correctedOffsetY > CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !hasUnreadMarkerReportAction) {
        runOnJS(setIsFloatingMessageCounterVisible)(true);
    }

    // hide floating button if we're scrolled closer than the offset and mark message as read
    if (correctedOffsetY < CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible && !hasUnreadMarkerReportAction) {
        runOnJS(setIsFloatingMessageCounterVisible)(false);
    }
}

export default floatingMessageCounterVisibilityHandler;
