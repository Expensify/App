import CONST from '@src/CONST';

/**
 * Returns the SWIPE_DIRECTION.RIGHT only for iOS, otherwise undefined.
 */
export default function getSwipeDirection() {
    return CONST.SWIPE_DIRECTION.RIGHT;
}
