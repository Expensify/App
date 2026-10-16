import {isMobile} from '@libs/Browser';

import {Dimensions} from 'react-native';

const TABLET_MIN_SCREEN_DIMENSION = 600;

function isTabletScreen(): boolean {
    return Math.min(window.screen.width, window.screen.height) >= TABLET_MIN_SCREEN_DIMENSION;
}

const isMobilePhoneWeb = isMobile() && !isTabletScreen();

const screenShortSide = Math.min(window.screen.width, window.screen.height);
const screenLongSide = Math.max(window.screen.width, window.screen.height);

function getViewportWidth(): number {
    return Dimensions.get('window').width;
}

/**
 * Returns whether the device is currently in landscape orientation. Returns false on tablets and non-mobile browsers.
 * Derived from the width instead of the Screen Orientation API (its `change` event lands in a different task than
 * `resize`, causing a flicker) and instead of the height (the soft keyboard shrinks height).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isInLandscapeMode(windowWidth: number = getViewportWidth(), windowHeight?: number): boolean {
    if (!isMobilePhoneWeb) {
        return false;
    }

    const distanceToLongSide = Math.abs(windowWidth - screenLongSide);
    const distanceToShortSide = Math.abs(windowWidth - screenShortSide);

    return distanceToLongSide < distanceToShortSide;
}

export default isInLandscapeMode;
