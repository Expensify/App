import {Animated, StyleSheet} from 'react-native';
import FontUtils from '@styles/utils/FontUtils';
// eslint-disable-next-line no-restricted-imports
import type StyleUtilGenerator from '@styles/utils/generators/types';
// eslint-disable-next-line no-restricted-imports
import positioning from '@styles/utils/positioning';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
import variables from '@styles/variables';
import type {GetTooltipStylesStyleUtil} from './types';

/** The height of a tooltip pointer */
const POINTER_HEIGHT = 4;

/** The width of a tooltip pointer */
const POINTER_WIDTH = 12;

/**
 * Generate styles for the tooltip component.
 *
 * @param tooltip - The reference to the tooltip's root element
 * @param currentSize - The current size of the tooltip used in the scaling animation.
 * @param windowWidth - The width of the window.
 * @param xOffset - The distance between the left edge of the wrapped component
 *                           and the left edge of the parent component.
 * @param yOffset - The distance between the top edge of the wrapped component
 *                           and the top edge of the parent component.
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
 * @param [shouldForceRenderingBelow] - Should display tooltip below the wrapped component.
 * @param [shouldForceRenderingLeft] - Align the tooltip left relative to the wrapped component instead of horizontally align center.
 * @param [wrapperStyle] - Any additional styles for the root wrapper.
 */
const createTooltipStyleUtils: StyleUtilGenerator<GetTooltipStylesStyleUtil> = ({theme, styles}) => ({
    getTooltipStyles: ({
        currentSize,
        xOffset,
        yOffset,
        tooltipTargetWidth,
        maxWidth,
        tooltipContentWidth,
        tooltipWrapperHeight,
        manualShiftHorizontal = 0,
        manualShiftVertical = 0,
        shouldForceRenderingLeft = false,
        wrapperStyle = {},
    }) => {
        const customWrapperStyle = StyleSheet.flatten(wrapperStyle);
        const tooltipVerticalPadding = spacing.pv1;

        // We calculate tooltip width based on the tooltip's content width
        // so the tooltip wrapper is just big enough to fit content and prevent white space.
        // NOTE: Add 1 to the tooltipWidth to prevent truncated text in Safari
        const tooltipWidth = tooltipContentWidth && tooltipContentWidth + spacing.ph2.paddingHorizontal * 2 + 1;
        const tooltipHeight = tooltipWrapperHeight;

        const isTooltipSizeReady = tooltipWidth !== undefined && tooltipHeight !== undefined;

        // Set the scale to 1 to be able to measure the tooltip size correctly when it's not ready yet.
        let scale = new Animated.Value(1);
        let rootWrapperTop = 0;
        let rootWrapperLeft = 0;
        let pointerWrapperTop = 0;
        let pointerWrapperLeft = 0;
        let opacity = 0;

        if (isTooltipSizeReady) {
            // When the tooltip size is ready, we can start animating the scale.
            scale = currentSize;

            // Because it uses absolute positioning, the top-left corner of the tooltip is aligned
            // with the top-left corner of the wrapped component by default.
            // we will use yOffset to position the tooltip relative to the Wrapped Component
            // So we need to shift the tooltip vertically and horizontally to position it correctly.
            //
            // First, we'll position it vertically.
            // To shift the tooltip down, we'll give `top` a positive value.
            // To shift the tooltip up, we'll give `top` a negative value.
            rootWrapperTop = yOffset - (tooltipHeight + POINTER_HEIGHT) + manualShiftVertical;

            // Next, we'll position it horizontally.
            // we will use xOffset to position the tooltip relative to the Wrapped Component
            // To shift the tooltip right, we'll give `left` a positive value.
            // To shift the tooltip left, we'll give `left` a negative value.
            //
            // So we'll:
            //   1a) Horizontally align left: No need for shifting.
            //   1b) Horizontally align center:
            //      - Shift the tooltip right (+) to the center of the component,
            //        so the left edge lines up with the component center.
            //      - Shift it left (-) to by half the tooltip's width,
            //        so the tooltip's center lines up with the center of the wrapped component.
            //   2) Add the manual horizontal shift passed in as a parameter.
            rootWrapperLeft = xOffset + (shouldForceRenderingLeft ? 0 : tooltipTargetWidth / 2 - tooltipWidth / 2) + manualShiftHorizontal;

            // By default, the pointer's top-left will align with the top-left of the tooltip wrapper.
            //
            // To align it vertically, the pointer up (-) by the pointer's height
            // so that the bottom of the pointer lines up with the top of the tooltip
            pointerWrapperTop = tooltipHeight;

            // To align it horizontally, we'll:
            //   1) Left align: Shift the pointer to the right (+) by half the pointer's width,
            //      so the left edge of the pointer does not overlap with the wrapper's border radius.
            //   2) Center align:
            //      - Shift the pointer to the right (+) by the half the tooltipWidth's width,
            //        so the left edge of the pointer lines up with the tooltipWidth's center.
            //      - To the left (-) by half the pointer's width,
            //        so the pointer's center lines up with the tooltipWidth's center.
            pointerWrapperLeft = shouldForceRenderingLeft ? POINTER_WIDTH / 2 : tooltipWidth / 2 - POINTER_WIDTH / 2;

            // React Native's measure() is asynchronous, we temporarily hide the tooltip until its bound is calculated
            opacity = 100;
        }

        return {
            animationStyle: {
                // remember Transform causes a new Local cordinate system
                // https://drafts.csswg.org/css-transforms-1/#transform-rendering
                // so Position fixed children will be relative to this new Local cordinate system
                transform: [{scale}],
            },
            rootWrapperStyle: {
                ...positioning.pAbsolute,
                backgroundColor: theme.heading,
                borderRadius: variables.componentBorderRadiusSmall,
                ...tooltipVerticalPadding,
                ...spacing.ph2,
                zIndex: variables.tooltipzIndex,
                width: tooltipWidth,
                maxWidth,
                top: rootWrapperTop,
                left: rootWrapperLeft,
                opacity,
                ...customWrapperStyle,

                // We are adding this to prevent the tooltip text from being selected and copied on CTRL + A.
                ...styles.userSelectNone,
                ...styles.pointerEventsNone,
            },
            textStyle: {
                color: theme.textReversed,
                ...FontUtils.fontFamily.platform.EXP_NEUE,
                fontSize: variables.fontSizeSmall,
                overflow: 'hidden',
                lineHeight: variables.lineHeightSmall,
                textAlign: 'center',
            },
            pointerWrapperStyle: {
                ...positioning.pAbsolute,
                top: pointerWrapperTop,
                left: pointerWrapperLeft,
                opacity,
            },
            pointerStyle: {
                width: 0,
                height: 0,
                backgroundColor: theme.transparent,
                borderStyle: 'solid',
                borderLeftWidth: POINTER_WIDTH / 2,
                borderRightWidth: POINTER_WIDTH / 2,
                borderTopWidth: POINTER_HEIGHT,
                borderLeftColor: theme.transparent,
                borderRightColor: theme.transparent,
                borderTopColor: customWrapperStyle.backgroundColor ?? theme.heading,
            },
        };
    },
});

export default createTooltipStyleUtils;
