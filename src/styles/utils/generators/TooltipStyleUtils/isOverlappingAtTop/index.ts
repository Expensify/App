import type IsOverlappingAtTop from './types';

/**
 * Determines if there is an overlapping element at the top of a given coordinate.
 *                    (targetCenterX, y)
 *                            |
 *                            v
 *                        _ _ _ _ _
 *                       |         |
 *                       |         |
 *                       |         |
 *                       |         |
 *                       |_ _ _ _ _|
 *
 * @param tooltip - The reference to the tooltip's root element
 * @param xOffset - The distance between the left edge of the window
 *                           and the left edge of the wrapped component.
 * @param yOffset - The distance between the top edge of the window
 *                           and the top edge of the wrapped component.
 * @param tooltipTargetWidth - The width of the tooltip's target
 * @param tooltipTargetHeight - The height of the tooltip's target
 */
const isOverlappingAtTop: IsOverlappingAtTop = (tooltip, xOffset, yOffset, tooltipTargetWidth, tooltipTargetHeight) => {
    if (typeof document.elementFromPoint !== 'function') {
        return false;
    }

    // Use the x center position of the target to prevent wrong element returned by elementFromPoint
    // in case the target has a border radius or is a multiline text.
    const targetCenterX = xOffset + tooltipTargetWidth / 2;
    const elementAtTargetCenterX = document.elementFromPoint(targetCenterX, yOffset);

    // Ensure it's not the already rendered element of this very tooltip, so the tooltip doesn't try to "avoid" itself
    if (!elementAtTargetCenterX || ('contains' in tooltip && tooltip.contains(elementAtTargetCenterX))) {
        return false;
    }

    const rectAtTargetCenterX = elementAtTargetCenterX.getBoundingClientRect();

    // Ensure it's not overlapping with another element by checking if the yOffset is greater than the top of the element
    // and less than the bottom of the element. Also ensure the tooltip target is not completely inside the elementAtTargetCenterX by vertical direction
    const isOverlappingAtTargetCenterX = yOffset > rectAtTargetCenterX.top && yOffset < rectAtTargetCenterX.bottom && yOffset + tooltipTargetHeight > rectAtTargetCenterX.bottom;

    return isOverlappingAtTargetCenterX;
};

export default isOverlappingAtTop;
