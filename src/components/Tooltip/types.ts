import type {TooltipAnchorAlignment} from '@src/types/utils/AnchorAlignment';
import type ChildrenProps from '@src/types/utils/ChildrenProps';

import type {BoundsObserver} from '@react-ng/bounds-observer';
import type {ForwardedRef, ReactNode} from 'react';
import type React from 'react';
import type {GestureResponderEvent, LayoutRectangle, StyleProp, ViewStyle} from 'react-native';

type SharedTooltipProps = {
    /** The text to display in the tooltip. If text is omitted, only children will be rendered. */
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

    /** Minimum width for a tooltip */
    minWidth?: number;

    /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
    renderTooltipContent?: () => ReactNode;

    /** Unique key of renderTooltipContent to rerender the tooltip when one of the key changes */
    renderTooltipContentKey?: string[];

    anchorAlignment?: TooltipAnchorAlignment;

    /** Whether to display tooltip below the wrapped component */
    shouldForceRenderingBelow?: boolean;

    /** Additional styles for tooltip wrapper view */
    wrapperStyle?: StyleProp<ViewStyle>;

    /** Should render a fullscreen transparent overlay */
    shouldUseOverlay?: boolean;

    shouldTeleportPortalToModalLayer?: boolean;
    onTooltipPress?: (event: GestureResponderEvent | KeyboardEvent | undefined) => void;
    computeHorizontalShiftForNative?: boolean;
};

type GenericTooltipState = {
    isVisible: boolean;
    showTooltip: () => void;
    hideTooltip: () => void;

    /** Update the tooltip's target bounding rectangle */
    updateTargetBounds: (rect: LayoutRectangle) => void;
};

type GenericTooltipProps = SharedTooltipProps & {
    children: React.FC<GenericTooltipState>;

    /** Whether the actual Tooltip should be rendered. If false, it's just going to return the children */
    shouldRender?: boolean;

    /** Whether to ignore TooltipSense activity and always trigger animation */
    shouldForceAnimate?: boolean;

    isEducationTooltip?: boolean;
};

type TooltipProps = ChildrenProps &
    SharedTooltipProps & {
        /** passes this down to Hoverable component to decide whether to handle the scroll behaviour to show hover once the scroll ends */
        shouldHandleScroll?: boolean;

        /** Whether the current screen or component is actively focused via navigation */
        isFocused?: boolean;

        ref?: ForwardedRef<BoundsObserver>;
    };

type EducationalTooltipProps = ChildrenProps &
    SharedTooltipProps & {
        /** Whether the actual Tooltip should be rendered. If false, it's just going to return the children */
        shouldRender?: boolean;

        /** Whether the tooltip content should be visible. When omitted, matches shouldRender. */
        shouldDisplayTooltip?: boolean;

        /** Whether the tooltip should hide when navigating */
        shouldHideOnNavigate?: boolean;

        /** Whether the tooltip should hide during scrolling */
        shouldHideOnScroll?: boolean;

        uniqueID?: string;
    };

type TooltipExtendedProps = (EducationalTooltipProps | TooltipProps) & {
    /** Whether the actual Tooltip should be rendered. If false, it's just going to return the children */
    shouldRender?: boolean;
};

export default TooltipProps;
export type {EducationalTooltipProps, GenericTooltipProps, SharedTooltipProps, TooltipExtendedProps, GenericTooltipState};
