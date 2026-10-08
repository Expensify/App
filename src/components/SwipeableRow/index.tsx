import type {SwipeableRowProps} from './types';

/** Swiping is a touch gesture; wide layouts and web keep the hover and context menus instead. */
function SwipeableRow({children}: SwipeableRowProps) {
    return children;
}

export default SwipeableRow;
