import roundToNearestMultipleOfFour from '@libs/roundToNearestMultipleOfFour';
import variables from '@styles/variables';
import type {ComputeHorizontalShift} from './types';

/** This defines the proximity with the edge of the window in which tooltips should not be displayed.
 * If a tooltip is too close to the edge of the screen, we'll shift it towards the center. */
const GUTTER_WIDTH = variables.gutterWidth;

/**
 * Compute the amount the tooltip needs to be horizontally shifted in order to keep it from displaying in the gutters.
 *
 * @param windowWidth - The width of the window.
 * @param xOffset - The distance between the left edge of the window
 *                           and the left edge of the wrapped component.
 * @param componentWidth - The width of the wrapped component.
 * @param tooltipWidth - The width of the tooltip itself.
 * @param [manualShiftHorizontal] - Any additional amount to manually shift the tooltip to the left or right.
 *                                         A positive value shifts it to the right,
 *                                         and a negative value shifts it to the left.
 */
const computeHorizontalShift: ComputeHorizontalShift = (windowWidth, xOffset, componentWidth, tooltipWidth, manualShiftHorizontal) => {
    // First find the left and right edges of the tooltip (by default, it is centered on the component).
    const componentCenter = xOffset + componentWidth / 2 + manualShiftHorizontal;
    const tooltipLeftEdge = componentCenter - tooltipWidth / 2;
    const tooltipRightEdge = componentCenter + tooltipWidth / 2;

    if (tooltipLeftEdge < GUTTER_WIDTH) {
        // Tooltip is in left gutter, shift right by a multiple of four.
        return roundToNearestMultipleOfFour(GUTTER_WIDTH - tooltipLeftEdge);
    }

    if (tooltipRightEdge > windowWidth - GUTTER_WIDTH) {
        // Tooltip is in right gutter, shift left by a multiple of four.
        return roundToNearestMultipleOfFour(windowWidth - GUTTER_WIDTH - tooltipRightEdge);
    }

    // Tooltip is not in the gutter, so no need to shift it horizontally
    return 0;
};

export {GUTTER_WIDTH};
export default computeHorizontalShift;
