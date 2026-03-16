import useWindowDimensions from '@hooks/useWindowDimensions';

/**
 * Returns whether the device is currently in landscape orientation.
 */
function useIsInLandscapeMode(): boolean {
    const {windowWidth, windowHeight} = useWindowDimensions();
    return windowWidth > windowHeight;
}

export default useIsInLandscapeMode;
