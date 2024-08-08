import type {StyleProp, TextStyle, View, ViewStyle} from 'react-native';
import {Animated, StyleSheet} from 'react-native';
import FontUtils from '@styles/utils/FontUtils';
// eslint-disable-next-line no-restricted-imports
import type StyleUtilGenerator from '@styles/utils/generators/types';
// eslint-disable-next-line no-restricted-imports
import spacing from '@styles/utils/spacing';
// eslint-disable-next-line no-restricted-imports
import titleBarHeight from '@styles/utils/titleBarHeight';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type {TooltipAnchorAlignment} from '@src/types/utils/AnchorAlignment';
import computeHorizontalShift, {GUTTER_WIDTH} from './computeHorizontalShift';
import isOverlappingAtTop from './isOverlappingAtTop';
import tooltipPlatformStyle from './tooltipPlatformStyles';

/** The height of a tooltip pointer */
const POINTER_HEIGHT = 4;

/** The width of a tooltip pointer */
const POINTER_WIDTH = 12;

type TooltipStyles = {
    animationStyle: ViewStyle;
    rootWrapperStyle: ViewStyle;
    textStyle: TextStyle;
    pointerWrapperStyle: ViewStyle;
    pointerStyle: ViewStyle;
};

type TooltipParams = {
    tooltip: View | HTMLDivElement | null;
    currentSize: Animated.Value;
    windowWidth: number;
    xOffset: number;
    yOffset: number;
    tooltipTargetWidth: number;
    tooltipTargetHeight: number;
    maxWidth: number;
    tooltipContentWidth?: number;
    tooltipWrapperHeight?: number;
    manualShiftHorizontal?: number;
    manualShiftVertical?: number;
    shouldForceRenderingBelow?: boolean;
    wrapperStyle: StyleProp<ViewStyle>;
    anchorAlignment?: TooltipAnchorAlignment;
    shouldAddHorizontalPadding?: boolean;
};

type GetTooltipStylesStyleUtil = {getTooltipStyles: (props: TooltipParams) => TooltipStyles};

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
 * @param [shouldForceRenderingBelow] - Should display tooltip below the wrapped component.
 * @param [anchorAlignment] - Align tooltip anchor horizontally and vertically.
 * @param [wrapperStyle] - Any additional styles for the root wrapper.
 */
const createTooltipStyleUtils: StyleUtilGenerator<GetTooltipStylesStyleUtil> = ({theme, styles}) => ({
    getTooltipStyles: ({
        tooltip,
        currentSize,
        windowWidth,
        xOffset,
        yOffset,
        tooltipTargetWidth,
        tooltipTargetHeight,
        maxWidth,
        tooltipContentWidth,
        tooltipWrapperHeight,
        manualShiftHorizontal = 0,
        manualShiftVertical = 0,
        shouldAddHorizontalPadding = true,
        shouldForceRenderingBelow = false,
        anchorAlignment = {
            horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
            vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.BOTTOM,
        },
        wrapperStyle = {},
    }) => {
        const customWrapperStyle = StyleSheet.flatten(wrapperStyle);
        const tooltipVerticalPadding = spacing.pv1;
        const tooltipHorizontalPadding = shouldAddHorizontalPadding ? spacing.ph2.paddingHorizontal * 2 : 0;

        // We calculate tooltip width based on the tooltip's content width
        // so the tooltip wrapper is just big enough to fit content and prevent white space.
        // NOTE: Add 1 to the tooltipWidth to prevent truncated text in Safari
        const tooltipWidth = tooltipContentWidth && tooltipContentWidth + tooltipHorizontalPadding + 1;
        const tooltipHeight = tooltipWrapperHeight;

        const isTooltipSizeReady = tooltipWidth !== undefined && tooltipHeight !== undefined;

        // Set the scale to 1 to be able to measure the tooltip size correctly when it's not ready yet.
        let scale = new Animated.Value(1);
        let shouldShowBelow = false;
        let horizontalShift = 0;
        let horizontalShiftPointer = 0;
        let rootWrapperTop = 0;
        let rootWrapperLeft = 0;
        let pointerWrapperTop = 0;
        let pointerWrapperLeft = 0;
        let pointerAdditionalStyle = {};
        let opacity = 0;

        if (isTooltipSizeReady) {
            // Determine if the tooltip should display below the wrapped component.
            // If either a tooltip will try to render within GUTTER_WIDTH or desktop header logical pixels of the top of the screen,
            // Or the wrapped component is overlapping at top-center with another element
            // we'll display it beneath its wrapped component rather than above it as usual.
            shouldShowBelow =
                shouldForceRenderingBelow ||
                yOffset - tooltipHeight - POINTER_HEIGHT < GUTTER_WIDTH + titleBarHeight ||
                !!(tooltip && isOverlappingAtTop(tooltip, xOffset, yOffset, tooltipTargetWidth, tooltipTargetHeight)) ||
                anchorAlignment.vertical === CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP;

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

            // By default, the pointer's top-left will align with the top-left of the tooltip wrapper.
            //
            // To align it vertically, we'll:
            //   If the pointer should be below the tooltip wrapper, shift the pointer down (+) by the tooltip height,
            //   so that the top of the pointer lines up with the bottom of the tooltip
            //
            //   OR if the pointer should be above the tooltip wrapper, then the pointer up (-) by the pointer's height
            //   so that the bottom of the pointer lines up with the top of the tooltip
            pointerWrapperTop = shouldShowBelow ? -POINTER_HEIGHT : tooltipHeight;

            // Horizontal tooltip position:
            // we will use xOffset to position the tooltip relative to the Wrapped Component
            // To shift the tooltip right, we'll give `left` a positive value.
            // To shift the tooltip left, we'll give `left` a negative value.
            //
            // So we'll:
            //   1) Add the horizontal shift (left or right) computed above to keep it out of the gutters.
            //   2) Add the manual horizontal shift passed in as a parameter.
            //   3a) Horizontally align left: No need for shifting.
            //   3b) Horizontally align center:
            //      - Shift the tooltip right (+) to the center of the component,
            //        so the left edge lines up with the component center.
            //      - Shift it left (-) to by half the tooltip's width,
            //        so the tooltip's center lines up with the center of the wrapped component.

            // Horizontal pointer position:
            //   1) Left align: Shift the pointer to the right (+) by half the pointer's width,
            //      so the left edge of the pointer does not overlap with the wrapper's border radius.
            //   2) Center align:
            //      - Shift the pointer to the right (+) by the half the tooltipWidth's width,
            //        so the left edge of the pointer lines up with the tooltipWidth's center.
            //      - To the left (-) by half the pointer's width,
            //        so the pointer's center lines up with the tooltipWidth's center.
            //      - Remove the wrapper's horizontalShift to maintain the pointer
            //        at the center of the hovered component.
            rootWrapperLeft = xOffset + horizontalShift + manualShiftHorizontal;
            switch (anchorAlignment.horizontal) {
                case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.LEFT:
                    pointerWrapperLeft = POINTER_WIDTH / 2;
                    break;
                case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.RIGHT:
                    pointerWrapperLeft = horizontalShiftPointer + (tooltipWidth - POINTER_WIDTH * 1.5);
                    rootWrapperLeft += tooltipTargetWidth - tooltipWidth;
                    break;
                case CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER:
                default:
                    pointerWrapperLeft = horizontalShiftPointer + (tooltipWidth / 2 - POINTER_WIDTH / 2);
                    rootWrapperLeft += tooltipTargetWidth / 2 - tooltipWidth / 2;
            }

            pointerAdditionalStyle = shouldShowBelow ? styles.flipUpsideDown : {};

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
                ...tooltipPlatformStyle,
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
                ...tooltipPlatformStyle,
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
                ...pointerAdditionalStyle,
            },
        };
    },
});

export default createTooltipStyleUtils;
