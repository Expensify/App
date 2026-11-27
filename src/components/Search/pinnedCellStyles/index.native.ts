import type {ViewStyle} from 'react-native';

/** Native tables don't hold pinned cells in place, so a pinned column only moves to the table's start. */
const PINNED_LEAD_STYLE: ViewStyle | undefined = undefined;

function getPinnedColumnStyle(): ViewStyle | undefined {
    return undefined;
}

function getPinnedInset(): string | undefined {
    return undefined;
}

const PINNED_CELL_CONTAINER_STYLE: ViewStyle | undefined = undefined;

export {PINNED_LEAD_STYLE, PINNED_CELL_CONTAINER_STYLE, getPinnedColumnStyle, getPinnedInset};
