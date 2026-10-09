import variables from '@styles/variables';

import roundToNearestMultipleOfFour from './roundToNearestMultipleOfFour';

// Read once at module level so the worklets below don't capture the whole variables object
const GUTTER_WIDTH = variables.gutterWidth;

/**
 * Compute the amount that the Context menu's Anchor needs to be horizontally shifted
 * in order to keep it from displaying in the gutters.
 *
 * @param anchorLeftEdge - Menu's anchor Left edge.
 * @param menuWidth - The width of the menu itself.
 * @param windowWidth - The width of the Window.
 */
function computeHorizontalShift(anchorLeftEdge: number, menuWidth: number, windowWidth: number): number {
    'worklet';

    const popoverRightEdge = anchorLeftEdge + menuWidth;
    if (anchorLeftEdge < GUTTER_WIDTH) {
        // Anchor is in left gutter, shift right by a multiple of four.
        return roundToNearestMultipleOfFour(GUTTER_WIDTH - anchorLeftEdge);
    }

    if (popoverRightEdge > windowWidth - GUTTER_WIDTH) {
        // Anchor is in right gutter, shift left by a multiple of four.
        return roundToNearestMultipleOfFour(windowWidth - GUTTER_WIDTH - popoverRightEdge);
    }

    // Anchor is not in the gutter, so no need to shift it horizontally
    return 0;
}

/**
 * Compute the amount that the Context menu's Anchor needs to be vertically shifted
 * in order to keep it from displaying in the window.
 *
 * @param anchorTopEdge - Menu's anchor Top edge.
 * @param menuHeight - The height of the menu itself.
 * @param windowHeight - The height of the Window.
 * @param anchorHeight - The height of anchor component
 * @param shouldSwitchPositionIfOverflow -
 */
function computeVerticalShift(anchorTopEdge: number, menuHeight: number, windowHeight: number, anchorHeight: number, shouldSwitchPositionIfOverflow = false): number {
    'worklet';

    const popoverBottomEdge = anchorTopEdge + menuHeight;
    let canSwitchPosition = false;

    if (anchorTopEdge < 0) {
        // Anchor is in top window Edge, shift bottom by a multiple of four.
        canSwitchPosition = popoverBottomEdge + menuHeight + anchorHeight <= windowHeight;
        return roundToNearestMultipleOfFour(shouldSwitchPositionIfOverflow && canSwitchPosition ? menuHeight + anchorHeight : 0 - anchorTopEdge);
    }

    if (popoverBottomEdge > windowHeight) {
        // Anchor is in Bottom window Edge, shift top by a multiple of four.
        canSwitchPosition = anchorTopEdge - menuHeight - anchorHeight >= 0;
        return roundToNearestMultipleOfFour(shouldSwitchPositionIfOverflow && canSwitchPosition ? -(menuHeight + anchorHeight) : windowHeight - popoverBottomEdge);
    }

    // Anchor is not in the gutter, so no need to shift it vertically
    return 0;
}

const PopoverWithMeasuredContentUtils = {computeHorizontalShift, computeVerticalShift};

export default PopoverWithMeasuredContentUtils;
