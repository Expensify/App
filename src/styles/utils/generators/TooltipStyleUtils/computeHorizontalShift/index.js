"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GUTTER_WIDTH = void 0;
var roundToNearestMultipleOfFour_1 = require("@libs/roundToNearestMultipleOfFour");
var variables_1 = require("@styles/variables");
/** This defines the proximity with the edge of the window in which tooltips should not be displayed.
 * If a tooltip is too close to the edge of the screen, we'll shift it towards the center. */
var GUTTER_WIDTH = variables_1.default.gutterWidth;
exports.GUTTER_WIDTH = GUTTER_WIDTH;
/**
 * Compute the amount the tooltip needs to be horizontally shifted in order to keep it from displaying in the gutters.
 *
 * @param windowWidth - The width of the window.
 * @param tooltipLeftEdge - The distance between the left edge of the tooltip
 *                           and the left edge of the wrapped component.
 * @param tooltipWidth - The width of the tooltip itself.
 */
var computeHorizontalShift = function (windowWidth, tooltipLeftEdge, tooltipWidth, tooltipWrapperLeft, tooltipWrapperWidth) {
    var tooltipRightEdge = tooltipLeftEdge + tooltipWidth;
    var tooltipWrapperRight = tooltipWrapperLeft + tooltipWrapperWidth;
    if (tooltipWrapperLeft < 0 || tooltipWrapperRight > windowWidth) {
        return 0;
    }
    if (tooltipLeftEdge < GUTTER_WIDTH) {
        // Tooltip is in left gutter, shift right by a multiple of four.
        return (0, roundToNearestMultipleOfFour_1.default)(GUTTER_WIDTH - tooltipLeftEdge);
    }
    if (tooltipRightEdge > windowWidth - GUTTER_WIDTH) {
        // Tooltip is in right gutter, shift left by a multiple of four.
        return (0, roundToNearestMultipleOfFour_1.default)(windowWidth - GUTTER_WIDTH - tooltipRightEdge);
    }
    // Tooltip is not in the gutter, so no need to shift it horizontally
    return 0;
};
exports.default = computeHorizontalShift;
