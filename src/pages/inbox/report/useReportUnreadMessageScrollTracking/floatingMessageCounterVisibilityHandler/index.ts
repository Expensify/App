import {scheduleOnRN} from 'react-native-worklets';
import CONST from '@src/CONST';
import type FloatingMessageCounterVisibilityHandlerParams from './types';

function floatingMessageCounterVisibilityHandler({
    wasManuallySetRef,
    isFloatingMessageCounterVisible,
    offsetY,
    setIsFloatingMessageCounterVisible,
    unreadMarkerReportActionIndex,
}: FloatingMessageCounterVisibilityHandlerParams) {
    'worklet';

    if (wasManuallySetRef.current) {
        return;
    }

    const hasUnreadMarkerReportAction = unreadMarkerReportActionIndex !== -1;

    // display floating button if we're scrolled more than the offset
    if (offsetY > CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD && !isFloatingMessageCounterVisible && !hasUnreadMarkerReportAction) {
        scheduleOnRN(setIsFloatingMessageCounterVisible, true);
    }

    // hide floating button if we're scrolled closer than the offset and mark message as read
    if (offsetY < CONST.REPORT.ACTIONS.LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD && isFloatingMessageCounterVisible && !hasUnreadMarkerReportAction) {
        scheduleOnRN(setIsFloatingMessageCounterVisible, false);
    }
}

export default floatingMessageCounterVisibilityHandler;
