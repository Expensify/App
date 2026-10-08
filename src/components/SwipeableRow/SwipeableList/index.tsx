import type SwipeableListProps from './types';

/** Swiping rows is native only; web keeps the hover and context menus. */
function SwipeableList({children}: SwipeableListProps) {
    return children;
}

export default SwipeableList;
