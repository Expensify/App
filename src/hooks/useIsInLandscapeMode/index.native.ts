import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeMode from '@libs/isInLandscapeMode';

/**
 * Returns whether the device is currently in landscape orientation.
 * If component already uses useResponsiveLayout, it will return the value from that hook.
 * If component already uses useWindowDimensions, use @libs/isInLandscapeMode instead.
 */
function useIsInLandscapeMode(): boolean {
    const {windowWidth, windowHeight} = useWindowDimensions();

    return isInLandscapeMode(windowWidth, windowHeight);
}

export default useIsInLandscapeMode;
