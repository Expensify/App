import type {ReactNode} from 'react';
import type React from 'react';
import type {LayoutRectangle, StyleProp, ViewStyle} from 'react-native';
import type {TooltipAnchorAlignment} from '@src/types/utils/AnchorAlignment';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

type SharedTooltipProps = {
    /** The text to display in the tooltip. If text is ommitted, only children will be rendered. */
    text?: string;

    /** Maximum number of lines to show in tooltip */
    numberOfLines?: number;

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal?: number | (() => number);

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical?: number | (() => number);

    /** Number of pixels to set max-width on tooltip  */
    maxWidth?: number;

    /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
    renderTooltipContent?: () => ReactNode;

    /** Unique key of renderTooltipContent to rerender the tooltip when one of the key changes */
    renderTooltipContentKey?: string[];

    /** The anchor alignment of the tooltip */
    anchorAlignment?: TooltipAnchorAlignment;

    /** Whether to display tooltip below the wrapped component */
    shouldForceRenderingBelow?: boolean;

    /** Additional styles for tooltip wrapper view */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Should render a fullscreen transparent overlay */
    shouldUseOverlay?: boolean;

    /** Callback to fire when the transparent overlay is pressed */
    onPressOverlay?: () => void;
};

type GenericTooltipState = {
    /** Is tooltip visible */
    isVisible: boolean;

    /** Show tooltip */
    showTooltip: () => void;

    /** Hide tooltip */
    hideTooltip: () => void;

    /** Update the tooltip's target bounding rectangle */
    updateTargetBounds: (rect: LayoutRectangle) => void;
};

type GenericTooltipProps = SharedTooltipProps & {
    children: React.FC<GenericTooltipState>;

    /** Whether to ignore TooltipSense activity and always triger animation */
    shouldForceAnimate?: boolean;
};

type TooltipProps = ChildrenProps &
    SharedTooltipProps & {
        /** passes this down to Hoverable component to decide whether to handle the scroll behaviour to show hover once the scroll ends */
        shouldHandleScroll?: boolean;
    };

type EducationalTooltipProps = ChildrenProps &
    SharedTooltipProps & {
        /** Whether to automatically dismiss the tooltip after 5 seconds */
        shouldAutoDismiss?: boolean;

        /** Whether the actual Tooltip should be rendered. If false, it's just going to return the children */
        shouldRender?: boolean;
    };

type TooltipExtendedProps = (EducationalTooltipProps | TooltipProps) & {
    /** Whether the actual Tooltip should be rendered. If false, it's just going to return the children */
    shouldRender?: boolean;
};

export default TooltipProps;
export type {EducationalTooltipProps, GenericTooltipProps, SharedTooltipProps, TooltipExtendedProps};
