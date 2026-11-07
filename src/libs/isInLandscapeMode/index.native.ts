import isTablet from '@libs/isTablet';

const isTabletDevice = isTablet();

/**
 * Returns whether the device is currently in landscape orientation.
 * Returns false on tablets.
 */
export default function isInLandscapeMode(windowWidth: number, windowHeight: number): boolean {
    return !isTabletDevice && windowWidth > windowHeight;
}
