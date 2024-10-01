import type {Animated} from 'react-native';
import type {SharedTooltipProps} from '@components/Tooltip/types';

type BaseGenericTooltipProps = {
    /** Window width */
    windowWidth: number;

    /** Tooltip Animation value */
    animation: Animated.Value;

    /** The distance between the left side of the wrapper view and the left side of the window */
    xOffset: number;

    /** The distance between the top of the wrapper view and the top of the window */
    yOffset: number;

    /** The width of the tooltip's target */
    targetWidth: number;

    /** The height of the tooltip's target */
    targetHeight: number;

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal?: number;

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical?: number;

    /** Handles what to do when hiding the tooltip */
    onHideTooltip?: () => void;
} & Pick<
    SharedTooltipProps,
    'renderTooltipContent' | 'maxWidth' | 'numberOfLines' | 'text' | 'shouldForceRenderingBelow' | 'wrapperStyle' | 'anchorAlignment' | 'shouldUseOverlay' | 'onHideTooltip'
>;

// eslint-disable-next-line import/prefer-default-export
export type {BaseGenericTooltipProps};
