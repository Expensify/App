// The real implementation is imported through its explicit index path, which the `isInLandscapeMode` alias does not match
import realIsInLandscapeMode from '@libs/isInLandscapeMode/index';

import {getDeviceMode} from './deviceMode';

/**
 * Storybook-only replacement for `@libs/isInLandscapeMode`, aliased in `.storybook/mockPaths.ts`.
 * Covers the components that read the orientation through `useResponsiveLayout` (e.g. `BigNumberPad`) instead of `useIsInLandscapeMode`.
 * Reports the orientation of the stored device mode, and otherwise the real one.
 */
function isInLandscapeMode(windowWidth?: number, windowHeight?: number): boolean {
    const deviceMode = getDeviceMode();
    return deviceMode ? deviceMode === 'mobileLandscape' : realIsInLandscapeMode(windowWidth, windowHeight);
}

export default isInLandscapeMode;
