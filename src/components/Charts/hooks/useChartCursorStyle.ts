import type {DerivedValue} from 'react-native-reanimated';

import {useAnimatedStyle} from 'react-native-reanimated';

/**
 * Animated style that swaps in a pointer cursor while hovering over a clickable chart
 * element (e.g. a bar), reverting to the default cursor otherwise.
 */
function useChartCursorStyle(isCursorOverClickable: DerivedValue<boolean>) {
    return useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));
}

export default useChartCursorStyle;
