import {isMobile} from '@libs/Browser';

/**
 * Returns whether the device is currently in landscape orientation.
 */
function getIsLandscapeOrientation(): boolean {
    const orientationType = window.screen?.orientation?.type;
    if (orientationType) {
        return orientationType.startsWith('landscape');
    }

    // Legacy iOS Safari (before 16.4) doesn't support the Screen Orientation API.
    const legacyOrientation = (window as {orientation?: number}).orientation;
    if (typeof legacyOrientation === 'number') {
        return Math.abs(legacyOrientation) === 90;
    }

    return window.screen.width > window.screen.height;
}

/**
 * windowWidth and windowHeight should be passed to keep the check reactive (see useResponsiveLayout()).
 * Version without params is needed for getIsNarrowLayout()
 */
function isInLandscapeMode(): boolean;
function isInLandscapeMode(windowWidth: number, windowHeight: number): boolean;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function isInLandscapeMode(windowWidth?: number, windowHeight?: number): boolean {
    return isMobile() && getIsLandscapeOrientation();
}

export default isInLandscapeMode;
