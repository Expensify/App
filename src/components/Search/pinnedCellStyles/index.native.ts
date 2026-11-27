import type {ViewStyle} from 'react-native';

/** Native tables don't hold pinned cells in place yet, so a pinned column only moves to its edge of the table. */
const PINNED_START_CELL_STYLE: ViewStyle | undefined = undefined;

/** Native has no covers to stack the pinned cells above. */
const PINNED_CELL_CONTAINER_STYLE: ViewStyle | undefined = undefined;

export {PINNED_START_CELL_STYLE, PINNED_CELL_CONTAINER_STYLE};
