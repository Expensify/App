type ChartTooltipAnchorProps = {
    /** Whether the tooltip is shown, the anchor only tracks its position while it is */
    isShown: boolean;

    /** Called with the window position of the chart's top-left corner each time it is measured or moves */
    onOriginChange: (x: number, y: number) => void;
};

export default ChartTooltipAnchorProps;
