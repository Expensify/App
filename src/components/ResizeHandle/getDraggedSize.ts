/** Turns pointer travel on a resize handle into a pane's or column's size. */
import lodashClamp from 'lodash/clamp';

type DraggedSizeSnap = {
    /** The size a drag catches on, e.g. the default size. */
    to: number;

    /** How close, in px, a drag has to come to `to` to catch on it. The pointer keeps moving, so dragging past it lets go. */
    threshold: number;
};

type DraggedSizeBounds = {
    min: number;

    /** Unbounded when omitted. */
    max?: number;

    snap?: DraggedSizeSnap;
};

/** `travel` is positive when the drag grows the size. The minimum wins over the maximum, and both win over the snap. */
function getDraggedSize(startSize: number, travel: number, {min, max = Infinity, snap}: DraggedSizeBounds): number {
    const size = Math.round(startSize + travel);
    const snappedSize = snap && Math.abs(size - snap.to) <= snap.threshold ? snap.to : size;

    return lodashClamp(snappedSize, min, max);
}

export default getDraggedSize;
export type {DraggedSizeSnap};
