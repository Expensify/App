import useWindowDimensions from '@hooks/useWindowDimensions';
import isInLandscapeMode from '@libs/isInLandscapeMode';

/**
 * Returns whether the device is currently in landscape orientation.
 */
function useIsInLandscapeMode(): boolean {
    const {windowWidth, windowHeight} = useWindowDimensions();

    return isInLandscapeMode(windowWidth, windowHeight);
}

export default useIsInLandscapeMode;
