/** Native tables don't hold pinned cells in place yet, so nothing ever scrolls beneath them to hide. */
function PinnedRowCover() {
    return null;
}

function PinnedGutterMask() {
    return null;
}

export {PinnedRowCover, PinnedGutterMask};
