/**
 * Reads a node's width as it mounts. Set in the commit, the width reaches the first paint, while `onLayout` only reports
 * it a frame later, after the columns already painted at their static widths.
 */
function getMeasureWidthRef(onWidth: (width: number) => void): ((node: unknown) => void) | undefined {
    return (node) => {
        if (!(node instanceof HTMLElement)) {
            return;
        }

        // `offsetWidth`, like react-native-web's `onLayout`, so the layout event that follows matches and doesn't re-render.
        onWidth(node.offsetWidth);
    };
}

export default getMeasureWidthRef;
