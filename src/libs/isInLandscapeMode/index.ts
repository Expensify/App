import {isMobile} from '@libs/Browser';
import isTablet, {TABLET_MIN_SCREEN_DIMENSION} from '@libs/isTablet';

import {Dimensions} from 'react-native';

/** Fixed at load, so components gated on it are never remounted. Use isInLandscapeMode() for the current screen. */
const isMobilePhoneWeb = isMobile() && !isTablet();

function getViewportWidth(): number {
    return Dimensions.get('window').width;
}

/**
 * Returns the short and long side of the browser window, including the browser UI. Unlike the viewport, it doesn't shrink
 * when the soft keyboard opens. Unlike `window.screen`, it follows the active panel of a foldable phone: Safari on a
 * foldable iPhone keeps reporting the cover panel in `window.screen` after the phone is unfolded. In split screen it is the
 * app's own window, so a split window that is wider than it is tall counts as landscape.
 *
 * During a `resize` event Safari can still report the previous window, e.g. the cover panel of a foldable iPhone right after
 * the app comes back to the foreground unfolded, and no later event corrects it. The window always contains the viewport,
 * so each side is raised to at least the viewport's. The soft keyboard only shrinks the viewport, so it can't raise them.
 */
function getWindowSides(): {shortSide: number; longSide: number} {
    const width = window.outerWidth || window.screen.width;
    const height = window.outerHeight || window.screen.height;
    const viewportShortSide = Math.min(window.innerWidth, window.innerHeight);
    const viewportLongSide = Math.max(window.innerWidth, window.innerHeight);

    return {shortSide: Math.max(Math.min(width, height), viewportShortSide), longSide: Math.max(width, height, viewportLongSide)};
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

    // Read on every call, because the window changes when a foldable phone is folded or unfolded. An unfolded phone is a tablet.
    const {shortSide, longSide} = getWindowSides();
    if (shortSide >= TABLET_MIN_SCREEN_DIMENSION) {
        return false;
    }

    const distanceToLongSide = Math.abs(windowWidth - longSide);
    const distanceToShortSide = Math.abs(windowWidth - shortSide);

    return distanceToLongSide < distanceToShortSide;
}

export default isInLandscapeMode;
export {isMobilePhoneWeb};
