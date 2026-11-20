/** Native tables don't hold pinned cells in place yet, so nothing ever scrolls beneath them to hide. */
function PinnedRowCovers() {
    return null;
}

function PinnedGutterMasks() {
    return null;
}

export {PinnedRowCovers, PinnedGutterMasks};
