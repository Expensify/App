import isTablet from '@libs/isTablet';

const isTabletDevice = isTablet();
const isMobilePhoneWeb = false;

/**
 * Returns whether the device is currently in landscape orientation.
 * Returns false on tablets.
 */
export default function isInLandscapeMode(windowWidth: number, windowHeight: number): boolean {
    return !isTabletDevice && windowWidth > windowHeight;
}

export {isMobilePhoneWeb};
