/** Where a screen's header goes inside the top inset, in points. */
type StatusRingHeaderLayout = {
    /** From the top of the window to the header's row. */
    topOffset: number;

    /** Below the header's row, down to the bottom of the status ring, so the content below the header stays clear of the ring. */
    bottomOffset: number;

    /** The room the header leaves at its left side, on top of its own padding. */
    left: number;

    /** The room the header leaves at its right side, on top of its own padding. */
    right: number;

    /** From the top of the window to the bottom of the header, which is where the screen's content starts. */
    height: number;
};

export default StatusRingHeaderLayout;
