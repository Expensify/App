/** Turns pointer travel on a resize handle into a pane's or column's size. */
import lodashClamp from 'lodash/clamp';

type DraggedSizeParams = {
    /** `1` when the handle sits on the trailing edge, so moving right grows the size. `-1` when it sits on the leading edge. */
    axisSign: 1 | -1;

    min: number;

    /** Unbounded when omitted. */
    max?: number;
};

/** The size a drag puts a pane or column at: its start size plus the pointer's travel, rounded and kept between the bounds. The minimum wins over the maximum. */
function getDraggedSize(startSize: number, startClientX: number, clientX: number, {axisSign, min, max = Infinity}: DraggedSizeParams): number {
    return lodashClamp(Math.round(startSize + axisSign * (clientX - startClientX)), min, max);
}

export default getDraggedSize;
