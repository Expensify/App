type ChartTooltipAnchorProps = {
    /** Whether the tooltip is shown, the anchor only tracks its position while it is */
    isShown: boolean;

    /** Called with the position of the chart's top-left corner in the layer the tooltip is drawn in, each time it is measured or moves */
    onOriginChange: (x: number, y: number) => void;
};

export default ChartTooltipAnchorProps;
