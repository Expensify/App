import {ForwardedRef, ReactNode} from 'react';

type TooltipProps = {
    /** The text to display in the tooltip. If text is ommitted, only children will be rendered. */
    text: string;

    /** Maximum number of lines to show in tooltip */
    numberOfLines: number;

    /** Children to wrap with Tooltip. */
    children: ReactNode;

    /** Any additional amount to manually adjust the horizontal position of the tooltip.
    A positive value shifts the tooltip to the right, and a negative value shifts it to the left. */
    shiftHorizontal: number | ((width: number) => number);

    /** Any additional amount to manually adjust the vertical position of the tooltip.
    A positive value shifts the tooltip down, and a negative value shifts it up. */
    shiftVertical: number | ((height: number) => number);

    /** Number of pixels to set max-width on tooltip  */
    maxWidth: number;

    /** Render custom content inside the tooltip. Note: This cannot be used together with the text props. */
    renderTooltipContent: unknown;

    /** Unique key of renderTooltipContent to rerender the tooltip when one of the key changes */
    renderTooltipContentKey: string[];

    /** passes this down to Hoverable component to decide whether to handle the scroll behaviour to show hover once the scroll ends */
    shouldHandleScroll: boolean;

    /** Reference to the tooltip container */
    tooltipRef: ForwardedRef<unknown>;
};

export {TooltipProps};
