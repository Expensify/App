/** Pick the group end farther from the anchor so a header-clicked range covers the whole group. */
function farthestEndFromAnchor(firstIdx: number, lastIdx: number, anchorIdx: number): 'first' | 'last' {
    if (anchorIdx < 0) {
        return 'last';
    }
    return Math.abs(firstIdx - anchorIdx) > Math.abs(lastIdx - anchorIdx) ? 'first' : 'last';
}

export default farthestEndFromAnchor;
