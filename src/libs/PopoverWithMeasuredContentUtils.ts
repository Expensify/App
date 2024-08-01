import variables from '@styles/variables';
import roundToNearestMultipleOfFour from './roundToNearestMultipleOfFour';

/**
 * Compute the amount that the Context menu's Anchor needs to be horizontally shifted
 * in order to keep it from displaying in the gutters.
 *
 * @param anchorLeftEdge - Menu's anchor Left edge.
 * @param menuWidth - The width of the menu itself.
 * @param windowWidth - The width of the Window.
 */
function computeHorizontalShift(anchorLeftEdge: number, menuWidth: number, windowWidth: number): number {
    const popoverRightEdge = anchorLeftEdge + menuWidth;
    if (anchorLeftEdge < variables.gutterWidth) {
        // Anchor is in left gutter, shift right by a multiple of four.
        return roundToNearestMultipleOfFour(variables.gutterWidth - anchorLeftEdge);
    }

    if (popoverRightEdge > windowWidth - variables.gutterWidth) {
        // Anchor is in right gutter, shift left by a multiple of four.
        return roundToNearestMultipleOfFour(windowWidth - variables.gutterWidth - popoverRightEdge);
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
 * @param shoudSwitchPositionIfOverflow -
 */
function computeVerticalShift(anchorTopEdge: number, menuHeight: number, windowHeight: number, anchorHeight: number, shoudSwitchPositionIfOverflow = false): number {
    const popoverBottomEdge = anchorTopEdge + menuHeight;
    let canSwitchPosition = false;

    if (anchorTopEdge < 0) {
        // Anchor is in top window Edge, shift bottom by a multiple of four.
        canSwitchPosition = popoverBottomEdge + menuHeight + anchorHeight <= windowHeight;
        return roundToNearestMultipleOfFour(shoudSwitchPositionIfOverflow && canSwitchPosition ? menuHeight + anchorHeight : 0 - anchorTopEdge);
    }

    if (popoverBottomEdge > windowHeight) {
        // Anchor is in Bottom window Edge, shift top by a multiple of four.
        canSwitchPosition = anchorTopEdge - menuHeight - anchorHeight >= 0;
        return roundToNearestMultipleOfFour(shoudSwitchPositionIfOverflow && canSwitchPosition ? -(menuHeight + anchorHeight) : windowHeight - popoverBottomEdge);
    }

    // Anchor is not in the gutter, so no need to shift it vertically
    return 0;
}

const PopoverWithMeasuredContentUtils = {computeHorizontalShift, computeVerticalShift};

export default PopoverWithMeasuredContentUtils;
