import {TextStyle, View, ViewStyle} from 'react-native';
import fontFamily from './fontFamily';
import roundToNearestMultipleOfFour from './roundToNearestMultipleOfFour';
import styles from './styles';
import themeColors from './themes/default';
import positioning from './utilities/positioning';
import spacing from './utilities/spacing';
import variables from './variables';

/** This defines the proximity with the edge of the window in which tooltips should not be displayed.
 * If a tooltip is too close to the edge of the screen, we'll shift it towards the center. */
const GUTTER_WIDTH = variables.gutterWidth;

/** The height of a tooltip pointer */
const POINTER_HEIGHT = 4;

/** The width of a tooltip pointer */
const POINTER_WIDTH = 12;

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
function computeHorizontalShift(windowWidth: number, xOffset: number, componentWidth: number, tooltipWidth: number, manualShiftHorizontal: number): number {
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
}

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
function isOverlappingAtTop(tooltip: View | HTMLDivElement, xOffset: number, yOffset: number, tooltipTargetWidth: number, tooltipTargetHeight: number) {
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
}

type TooltipStyles = {
    animationStyle: ViewStyle;
    rootWrapperStyle: ViewStyle;
    textStyle: TextStyle;
    pointerWrapperStyle: ViewStyle;
    pointerStyle: ViewStyle;
};

/**
 * Generate styles for the tooltip component.
 *
 * @param tooltip - The reference to the tooltip's root element
 * @param currentSize - The current size of the tooltip used in the scaling animation.
 * @param windowWidth - The width of the window.
 * @param xOffset - The distance between the left edge of the window
 *                           and the left edge of the wrapped component.
 * @param yOffset - The distance between the top edge of the window
 *                           and the top edge of the wrapped component.
 * @param tooltipTargetWidth - The width of the tooltip's target
 * @param tooltipTargetHeight - The height of the tooltip's target
 * @param maxWidth - The tooltip's max width.
 * @param tooltipContentWidth - The tooltip's inner content measured width.
 * @param tooltipWrapperHeight - The tooltip's wrapper measured height.
 * @param [manualShiftHorizontal] - Any additional amount to manually shift the tooltip to the left or right.
 *                                         A positive value shifts it to the right,
 *                                         and a negative value shifts it to the left.
 * @param [manualShiftVertical] - Any additional amount to manually shift the tooltip up or down.
 *                                       A positive value shifts it down, and a negative value shifts it up.
 */
export default function getTooltipStyles(
    tooltip: View | HTMLDivElement,
    currentSize: number,
    windowWidth: number,
    xOffset: number,
    yOffset: number,
    tooltipTargetWidth: number,
    tooltipTargetHeight: number,
    maxWidth: number,
    tooltipContentWidth: number,
    tooltipWrapperHeight: number,
    manualShiftHorizontal = 0,
    manualShiftVertical = 0,
): TooltipStyles {
    const tooltipVerticalPadding = spacing.pv1;

    // We calculate tooltip width based on the tooltip's content width
    // so the tooltip wrapper is just big enough to fit content and prevent white space.
    // NOTE: Add 1 to the tooltipWidth to prevent truncated text in Safari
    const tooltipWidth = tooltipContentWidth && tooltipContentWidth + spacing.ph2.paddingHorizontal * 2 + 1;
    const tooltipHeight = tooltipWrapperHeight;

    const isTooltipSizeReady = tooltipWidth !== undefined && tooltipHeight !== undefined;

    // Set the scale to 1 to be able to measure the tooltip size correctly when it's not ready yet.
    let scale = 1;
    let shouldShowBelow = false;
    let horizontalShift = 0;
    let horizontalShiftPointer = 0;
    let rootWrapperTop = 0;
    let rootWrapperLeft = 0;
    let pointerWrapperTop = 0;
    let pointerWrapperLeft = 0;
    let pointerAdditionalStyle = {};

    if (isTooltipSizeReady) {
        // Determine if the tooltip should display below the wrapped component.
        // If either a tooltip will try to render within GUTTER_WIDTH logical pixels of the top of the screen,
        // Or the wrapped component is overlapping at top-center with another element
        // we'll display it beneath its wrapped component rather than above it as usual.
        shouldShowBelow = yOffset - tooltipHeight < GUTTER_WIDTH || isOverlappingAtTop(tooltip, xOffset, yOffset, tooltipTargetWidth, tooltipTargetHeight);

        // When the tooltip size is ready, we can start animating the scale.
        scale = currentSize;

        // Determine if we need to shift the tooltip horizontally to prevent it
        // from displaying too near to the edge of the screen.
        horizontalShift = computeHorizontalShift(windowWidth, xOffset, tooltipTargetWidth, tooltipWidth, manualShiftHorizontal);

        // Determine if we need to shift the pointer horizontally to prevent it from being too near to the edge of the tooltip
        // We shift it to the right a bit if the tooltip is positioned on the extreme left
        // and shift it to left a bit if the tooltip is positioned on the extreme right.
        horizontalShiftPointer =
            horizontalShift > 0
                ? Math.max(-horizontalShift, -(tooltipWidth / 2) + POINTER_WIDTH / 2 + variables.componentBorderRadiusSmall)
                : Math.min(-horizontalShift, tooltipWidth / 2 - POINTER_WIDTH / 2 - variables.componentBorderRadiusSmall);

        // Because it uses fixed positioning, the top-left corner of the tooltip is aligned
        // with the top-left corner of the window by default.
        // we will use yOffset to position the tooltip relative to the Wrapped Component
        // So we need to shift the tooltip vertically and horizontally to position it correctly.
        //
        // First, we'll position it vertically.
        // To shift the tooltip down, we'll give `top` a positive value.
        // To shift the tooltip up, we'll give `top` a negative value.
        rootWrapperTop = shouldShowBelow
            ? // We need to shift the tooltip down below the component. So shift the tooltip down (+) by...
              yOffset + tooltipTargetHeight + POINTER_HEIGHT + manualShiftVertical
            : // We need to shift the tooltip up above the component. So shift the tooltip up (-) by...
              yOffset - (tooltipHeight + POINTER_HEIGHT) + manualShiftVertical;

        // Next, we'll position it horizontally.
        // we will use xOffset to position the tooltip relative to the Wrapped Component
        // To shift the tooltip right, we'll give `left` a positive value.
        // To shift the tooltip left, we'll give `left` a negative value.
        //
        // So we'll:
        //   1) Shift the tooltip right (+) to the center of the component,
        //      so the left edge lines up with the component center.
        //   2) Shift it left (-) to by half the tooltip's width,
        //      so the tooltip's center lines up with the center of the wrapped component.
        //   3) Add the horizontal shift (left or right) computed above to keep it out of the gutters.
        //   4) Lastly, add the manual horizontal shift passed in as a parameter.
        rootWrapperLeft = xOffset + (tooltipTargetWidth / 2 - tooltipWidth / 2) + horizontalShift + manualShiftHorizontal;

        // By default, the pointer's top-left will align with the top-left of the tooltip wrapper.
        //
        // To align it vertically, we'll:
        //   If the pointer should be below the tooltip wrapper, shift the pointer down (+) by the tooltip height,
        //   so that the top of the pointer lines up with the bottom of the tooltip
        //
        //   OR if the pointer should be above the tooltip wrapper, then the pointer up (-) by the pointer's height
        //   so that the bottom of the pointer lines up with the top of the tooltip
        pointerWrapperTop = shouldShowBelow ? -POINTER_HEIGHT : tooltipHeight;

        // To align it horizontally, we'll:
        //   1) Shift the pointer to the right (+) by the half the tooltipWidth's width,
        //      so the left edge of the pointer lines up with the tooltipWidth's center.
        //   2) To the left (-) by half the pointer's width,
        //      so the pointer's center lines up with the tooltipWidth's center.
        //   3) Remove the wrapper's horizontalShift to maintain the pointer
        //      at the center of the hovered component.
        pointerWrapperLeft = horizontalShiftPointer + (tooltipWidth / 2 - POINTER_WIDTH / 2);

        pointerAdditionalStyle = shouldShowBelow ? styles.flipUpsideDown : {};
    }

    return {
        animationStyle: {
            // remember Transform causes a new Local cordinate system
            // https://drafts.csswg.org/css-transforms-1/#transform-rendering
            // so Position fixed children will be relative to this new Local cordinate system
            transform: [{scale}],
        },
        rootWrapperStyle: {
            ...positioning.pFixed,
            backgroundColor: themeColors.heading,
            borderRadius: variables.componentBorderRadiusSmall,
            ...tooltipVerticalPadding,
            ...spacing.ph2,
            zIndex: variables.tooltipzIndex,
            width: tooltipWidth,
            maxWidth,
            top: rootWrapperTop,
            left: rootWrapperLeft,

            // We are adding this to prevent the tooltip text from being selected and copied on CTRL + A.
            ...styles.userSelectNone,
            ...styles.pointerEventsNone,
        },
        textStyle: {
            color: themeColors.textReversed,
            fontFamily: fontFamily.EXP_NEUE,
            fontSize: variables.fontSizeSmall,
            overflow: 'hidden',
            lineHeight: variables.lineHeightSmall,
            textAlign: 'center',
        },
        pointerWrapperStyle: {
            ...positioning.pFixed,
            top: pointerWrapperTop,
            left: pointerWrapperLeft,
        },
        pointerStyle: {
            width: 0,
            height: 0,
            backgroundColor: themeColors.transparent,
            borderStyle: 'solid',
            borderLeftWidth: POINTER_WIDTH / 2,
            borderRightWidth: POINTER_WIDTH / 2,
            borderTopWidth: POINTER_HEIGHT,
            borderLeftColor: themeColors.transparent,
            borderRightColor: themeColors.transparent,
            borderTopColor: themeColors.heading,
            ...pointerAdditionalStyle,
        },
    };
}
