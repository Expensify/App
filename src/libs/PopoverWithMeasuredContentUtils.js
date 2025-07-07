"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var variables_1 = require("@styles/variables");
var roundToNearestMultipleOfFour_1 = require("./roundToNearestMultipleOfFour");
/**
 * Compute the amount that the Context menu's Anchor needs to be horizontally shifted
 * in order to keep it from displaying in the gutters.
 *
 * @param anchorLeftEdge - Menu's anchor Left edge.
 * @param menuWidth - The width of the menu itself.
 * @param windowWidth - The width of the Window.
 */
function computeHorizontalShift(anchorLeftEdge, menuWidth, windowWidth) {
    var popoverRightEdge = anchorLeftEdge + menuWidth;
    if (anchorLeftEdge < variables_1.default.gutterWidth) {
        // Anchor is in left gutter, shift right by a multiple of four.
        return (0, roundToNearestMultipleOfFour_1.default)(variables_1.default.gutterWidth - anchorLeftEdge);
    }
    if (popoverRightEdge > windowWidth - variables_1.default.gutterWidth) {
        // Anchor is in right gutter, shift left by a multiple of four.
        return (0, roundToNearestMultipleOfFour_1.default)(windowWidth - variables_1.default.gutterWidth - popoverRightEdge);
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
function computeVerticalShift(anchorTopEdge, menuHeight, windowHeight, anchorHeight, shouldSwitchPositionIfOverflow) {
    if (shouldSwitchPositionIfOverflow === void 0) { shouldSwitchPositionIfOverflow = false; }
    var popoverBottomEdge = anchorTopEdge + menuHeight;
    var canSwitchPosition = false;
    if (anchorTopEdge < 0) {
        // Anchor is in top window Edge, shift bottom by a multiple of four.
        canSwitchPosition = popoverBottomEdge + menuHeight + anchorHeight <= windowHeight;
        return (0, roundToNearestMultipleOfFour_1.default)(shouldSwitchPositionIfOverflow && canSwitchPosition ? menuHeight + anchorHeight : 0 - anchorTopEdge);
    }
    if (popoverBottomEdge > windowHeight) {
        // Anchor is in Bottom window Edge, shift top by a multiple of four.
        canSwitchPosition = anchorTopEdge - menuHeight - anchorHeight >= 0;
        return (0, roundToNearestMultipleOfFour_1.default)(shouldSwitchPositionIfOverflow && canSwitchPosition ? -(menuHeight + anchorHeight) : windowHeight - popoverBottomEdge);
    }
    // Anchor is not in the gutter, so no need to shift it vertically
    return 0;
}
var PopoverWithMeasuredContentUtils = { computeHorizontalShift: computeHorizontalShift, computeVerticalShift: computeVerticalShift };
exports.default = PopoverWithMeasuredContentUtils;
