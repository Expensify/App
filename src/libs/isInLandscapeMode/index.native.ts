import isTablet from '@libs/isTablet';
import TABLET_MIN_SCREEN_DIMENSION from '@libs/isTablet/TABLET_MIN_SCREEN_DIMENSION';

const isTabletDevice = isTablet();
const isMobilePhoneWeb = false;

/**
 * Returns whether the device is currently in landscape orientation.
 * Returns false on tablets and on a foldable phone while its window is as big as a tablet's.
 */
export default function isInLandscapeMode(windowWidth: number, windowHeight: number): boolean {
    if (isTabletDevice) {
        return false;
    }

    // A foldable phone always reports itself as a phone, so the window is checked on every call: unfolded, it has room for
    // the regular layout, and the landscape layout is meant for a window that is short.
    if (Math.min(windowWidth, windowHeight) >= TABLET_MIN_SCREEN_DIMENSION) {
        return false;
    }

    return windowWidth > windowHeight;
}

export {isMobilePhoneWeb};
