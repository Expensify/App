import variables from '@styles/variables';

import type {LayoutRectangle} from 'react-native';
import type {EdgeInsets} from 'react-native-safe-area-context';

/** Tooltip hides when content moves this far past the header/footer. */
const OFFSET = 10;

type WindowSize = {width: number; height: number};

/**
 * Whether the tooltip's target has moved far enough out of the safe area that the tooltip should hide,
 * e.g. it scrolled behind the header or the bottom tab.
 *
 * `windowSize` comes from `Dimensions.get('window')`, which already excludes the horizontal safe-area
 * insets (e.g. a landscape display cutout). `bounds.x` is measured from the window edge that includes
 * them, so shifting by the left inset is what puts both on the same origin. Adding the right inset to
 * the element's right edge would count that inset twice and make anything near the right edge look
 * like it overflows.
 */
function isTooltipTargetOutOfBounds(bounds: LayoutRectangle, insets: EdgeInsets, windowSize: WindowSize): boolean {
    const {x, y, width, height} = bounds;

    const top = y - (insets.top || 0);
    const bottom = y + height + (insets.bottom || 0);
    const left = x - (insets.left || 0);
    const right = left + width;

    // Space available at the top, accounting for the header height
    const availableHeightForTop = top - (variables.contentHeaderHeight - OFFSET);

    // Space available after accounting for the bottom tab
    const availableHeightForBottom = windowSize.height - (bottom + variables.bottomTabHeight - OFFSET);

    const availableWidthForLeft = left + OFFSET;
    const availableWidthForRight = windowSize.width - (right - OFFSET);

    return availableHeightForTop < 0 || availableHeightForBottom < 0 || availableWidthForLeft < 0 || availableWidthForRight < 0;
}

export default isTooltipTargetOutOfBounds;
