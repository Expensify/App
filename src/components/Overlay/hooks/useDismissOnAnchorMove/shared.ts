const ANCHOR_MOVE_EPSILON_PX = 1;

type RectEdges = {left: number; top: number; right: number; bottom: number};

/** True when the anchor's box shifted beyond a sub-pixel epsilon on any of the four edges — position or size. */
function anchorBoxChanged(a: RectEdges, b: RectEdges): boolean {
    return (
        Math.abs(a.left - b.left) > ANCHOR_MOVE_EPSILON_PX ||
        Math.abs(a.top - b.top) > ANCHOR_MOVE_EPSILON_PX ||
        Math.abs(a.right - b.right) > ANCHOR_MOVE_EPSILON_PX ||
        Math.abs(a.bottom - b.bottom) > ANCHOR_MOVE_EPSILON_PX
    );
}

export default anchorBoxChanged;
