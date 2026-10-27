import {markChartTouch} from '@components/Charts/utils/pinnedChartTooltip';

import {useState} from 'react';
import {PointerType} from 'react-native-gesture-handler';
import {scheduleOnRN} from 'react-native-worklets';

/**
 * Tracks the tooltip pinned by a touch tap, which a touch anywhere on the screen hides.
 * @param hideTooltip - hides the chart's tooltip and clears its matched target
 */
function useTouchPinnedTooltip(hideTooltip: () => void) {
    /** True while a tooltip opened by a touch tap is shown */
    const [isTouchPinned, setIsTouchPinned] = useState(false);

    const dismissTouchTooltip = () => {
        hideTooltip();
        setIsTouchPinned(false);
    };

    const onTooltipDismiss = isTouchPinned ? dismissTouchTooltip : undefined;

    const onTapFinalize = (e: {pointerType: PointerType; canceled: boolean}) => {
        'worklet';

        if (!e.canceled || e.pointerType !== PointerType.TOUCH || !isTouchPinned) {
            return;
        }
        scheduleOnRN(dismissTouchTooltip);
    };

    return {
        /** Sets whether the tooltip is pinned by a touch tap */
        setIsTouchPinned,
        /** Hides the tooltip and unpins it */
        dismissTouchTooltip,
        /** Hides the pinned tooltip, undefined while nothing is pinned */
        onTooltipDismiss,
        /** Pass to the tap gesture's onFinalize */
        onTapFinalize,
        /** Marks a touch on this chart, so the screen's touch start keeps the tooltip and lets the tap switch it */
        onChartTouchStart: () => markChartTouch(onTooltipDismiss),
    };
}

export default useTouchPinnedTooltip;
