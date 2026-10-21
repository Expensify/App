/** Turns pointer travel on a resize handle into a pane's or column's size. */
import lodashClamp from 'lodash/clamp';

type DraggedSizeBounds = {
    min: number;

    /** Unbounded when omitted. */
    max?: number;
};

/** The size a drag puts a pane or column at: its start size plus `travel`, rounded and kept between the bounds. `travel` is positive when the drag grows the size. The minimum wins over the maximum. */
function getDraggedSize(startSize: number, travel: number, {min, max = Infinity}: DraggedSizeBounds): number {
    return lodashClamp(Math.round(startSize + travel), min, max);
}

export default getDraggedSize;
