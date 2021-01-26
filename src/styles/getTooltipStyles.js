import {Dimensions} from 'react-native';
import spacing from './utilities/spacing';
import styles from './styles';
import themeColors from './themes/default';
import fontFamily from './fontFamily';
import variables from './variables';

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

export default function getTooltipStyles(
    interpolatedSize,
    xOffset,
    yOffset,
    width,
    height,
    tooltipWidth,
    tooltipHeight,
) {
    // Determine if the tooltip should display below the wrapped component.
    const windowWidth = Dimensions.get('window').width;
    const shouldShowBelow = (yOffset - tooltipHeight) < GUTTER_WIDTH;

    // Determine if we need to shift the tooltip horizontally to prevent it
    // from displaying too near to the edge of the screen.
    let horizontalShift = 0;
    const tooltipLeftEdge = (xOffset + (width / 2)) - (tooltipWidth / 2);
    const tooltipRightEdge = (xOffset + (width / 2)) + (tooltipWidth / 2);
    if (tooltipLeftEdge < GUTTER_WIDTH) {
        // Tooltip is in left gutter, shift right
        horizontalShift = GUTTER_WIDTH - tooltipLeftEdge;
    } else if (tooltipRightEdge > (windowWidth - GUTTER_WIDTH)) {
        // Tooltip is in right gutter, shift left
        horizontalShift = (windowWidth - GUTTER_WIDTH) - tooltipRightEdge;
    }
    horizontalShift = roundToNearestMultipleOfFour(horizontalShift);

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
            top: shouldShowBelow ? height + 3 : -26,

            // Shift the tooltip to the left by...
            //   half the component's width
            // + half the tooltip's width
            // + any horizontal shift
            left: (tooltipWidth / -2) + (width / 2) + horizontalShift,
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
            top: shouldShowBelow ? height - 4 : -4,

            // Shift the pointer to the right (to the middle of the wrapped element)
            left: (width / 2) - 4,
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
