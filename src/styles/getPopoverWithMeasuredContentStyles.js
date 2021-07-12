import roundToNearestMultipleOfFour from './roundToNearestMultipleOfFour';
import variables from './variables';

/**
 * Compute the amount that the Context menu's Anchor needs to be horizontally shifted
 * in order to keep it from displaying in the gutters.
 *
 * @param {Number} anchorLeftEdge - Menu's anchor Left edge.
 * @param {Number} menuWidth - The width of the menu itself.
 * @param {Number} windowWidth - The width of the Window.
 * @returns {Number}
 */
function computeHorizontalShift(anchorLeftEdge, menuWidth, windowWidth) {
    const popoverRightEdge = anchorLeftEdge + menuWidth;
    if (anchorLeftEdge < variables.gutterWidth) {
        // Anchor is in left gutter, shift right by a multiple of four.
        return roundToNearestMultipleOfFour(variables.gutterWidth - anchorLeftEdge);
    }

    if (popoverRightEdge > (windowWidth - variables.gutterWidth)) {
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
 * @param {Number} anchorTopEdge - Menu's anchor Top edge.
 * @param {Number} menuHeight - The height of the menu itself.
 * @param {Number} windowHeight - The height of the Window.
 * @returns {Number}
 */
function computeVerticalShift(anchorTopEdge, menuHeight, windowHeight) {
    const popoverBottomEdge = anchorTopEdge + menuHeight;

    if (anchorTopEdge < 0) {
        // Anchor is in top window Edge, shift bottom by a multiple of four.
        return roundToNearestMultipleOfFour(0 - anchorTopEdge);
    }

    if (popoverBottomEdge > windowHeight) {
        // Anchor is in Bottom window Edge, shift top by a multiple of four.
        return roundToNearestMultipleOfFour(windowHeight - popoverBottomEdge);
    }

    // Anchor is not in the gutter, so no need to shift it vertically
    return 0;
}

export {
    computeHorizontalShift,
    computeVerticalShift,
};
