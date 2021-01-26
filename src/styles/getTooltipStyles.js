import {Dimensions} from 'react-native';
import spacing from './utilities/spacing';
import styles from './styles';
import themeColors from './themes/default';
import fontFamily from './fontFamily';
import variables from './variables';

// This defines the proximity with the edge of the window in which tooltips should not be displayed.
// If a tooltip is too close to the edge of the screen, we'll shift it towards the center.
const GUTTER_WIDTH = 16;

/**
 * The Expensify.cash repo is very consistent about doing spacing in multiples of 4.
 * In an effort to maintain that consistency, we'll make sure that any distance we're shifting the tooltip
 * is a multiple of 4.
 *
 * @param {Number} n
 * @returns {Number}
 */
function roundToNearestMultipleOfFour(n) {
    if (n > 0) {
        return Math.ceil(n / 4.0) * 4;
    }

    if (n < 0) {
        return Math.floor(n / 4.0) * 4;
    }

    return 0;
}

/**
 * Compute the amount the tooltip needs to be horizontally shifted in order to keep it from displaying in the gutters.
 *
 * @param {Number} windowWidth - The width of the window.
 * @param {Number} xOffset - The distance between the left edge of the window
 *                           and the left edge of the wrapped component.
 * @param {Number} componentWidth - The width of the wrapped component.
 * @param {Number} tooltipWidth - The width of the tooltip itself.
 * @returns {Number}
 */
function computeHorizontalShift(windowWidth, xOffset, componentWidth, tooltipWidth) {
    // First find the left and right edges of the tooltip.
    const componentCenter = xOffset + (componentWidth / 2);
    const tooltipLeftEdge = componentCenter - (tooltipWidth / 2);
    const tooltipRightEdge = componentCenter + (tooltipWidth / 2);

    if (tooltipLeftEdge < GUTTER_WIDTH) {
        // Tooltip is in left gutter, shift right by a multiple of four.
        return roundToNearestMultipleOfFour(GUTTER_WIDTH - tooltipLeftEdge);
    }

    if (tooltipRightEdge > (windowWidth - GUTTER_WIDTH)) {
        // Tooltip is in right gutter, shift left by a multiple of four.
        return roundToNearestMultipleOfFour(windowWidth - GUTTER_WIDTH - tooltipRightEdge);
    }

    // Tooltip is not in the gutter, so no need to shift it horizontally
    return 0;
}

/**
 * Generate styles for the tooltip component.
 *
 * @param {Number} interpolatedSize - The current size of the tooltip used in the scaling animation.
 * @param {Number} xOffset - The distance between the left edge of the window
 *                           and the left edge of the wrapped component.
 * @param {Number} yOffset - The distance between the top edge of the window
 *                           and the top edge of the wrapped component.
 * @param {Number} componentWidth - The width of the wrapped component.
 * @param {Number} componentHeight - The height of the wrapped component.
 * @param {Number} tooltipWidth - The width of the tooltip itself.
 * @param {Number} tooltipHeight - The height of the tooltip itself.
 * @returns {Object}
 */
export default function getTooltipStyles(
    interpolatedSize: Number,
    xOffset: Number,
    yOffset: Number,
    componentWidth: Number,
    componentHeight: Number,
    tooltipWidth: Number,
    tooltipHeight: Number,
) {
    // Determine if the tooltip should display below the wrapped component.
    // If a tooltip will try to render within GUTTER_WIDTH logical pixels of the top of the screen,
    // we'll display it beneath its wrapped component rather than above it as usual.
    const windowWidth = Dimensions.get('window').width;
    const shouldShowBelow = (yOffset - tooltipHeight) < GUTTER_WIDTH;

    // Determine if we need to shift the tooltip horizontally to prevent it
    // from displaying too near to the edge of the screen.
    const horizontalShift = computeHorizontalShift(windowWidth, xOffset, componentWidth, tooltipWidth);

    return {
        animationStyle: {
            transform: [{
                scale: interpolatedSize,
            }],
        },
        tooltipWrapperStyle: {
            position: 'absolute',
            backgroundColor: themeColors.heading,
            borderRadius: variables.componentBorderRadiusSmall,
            ...spacing.pv1,
            ...spacing.ph2,

            // Shift the tooltip up by...
            //   11 (font height)
            // + 4 (top padding)
            // + 4 (bottom padding)
            // + 4 (upward shift of the pointer)
            // + 3 (pointer height - 1)
            // = 26
            // OR
            // Shift the tooltip down by...
            // (component height) + (pointer height - 1)
            top: shouldShowBelow ? componentHeight + 3 : -26,

            // Shift the tooltip to the left by...
            //   half the component's width
            // + half the tooltip's width
            // + any horizontal shift
            left: (tooltipWidth / -2) + (componentWidth / 2) + horizontalShift,
        },
        tooltipTextStyle: {
            color: themeColors.textReversed,
            fontFamily: fontFamily.GTA,
            fontSize: variables.fontSizeSmall,
        },
        pointerWrapperStyle: {
            position: 'absolute',

            // Shift the pointer up by its height
            // OR
            // Down by the component's height - its height
            top: shouldShowBelow ? componentHeight - 4 : -4,

            // Shift the pointer to the right (to the middle of the wrapped element)
            left: (componentWidth / 2) - 4,
        },
        pointerStyle: {
            width: 0,
            height: 0,
            backgroundColor: 'transparent',
            borderStyle: 'solid',
            borderLeftWidth: 4,
            borderRightWidth: 4,
            borderTopWidth: 7,
            borderLeftColor: 'transparent',
            borderRightColor: 'transparent',
            borderTopColor: themeColors.heading,
            ...(shouldShowBelow ? styles.flipUpsideDown : {}),
        },
    };
}
