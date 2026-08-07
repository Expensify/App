import isInLandscapeMode from '@libs/isInLandscapeMode';
/**
 * Returns whether device that uses mWeb is currently in landscape orientation.
 */
function useIsInLandscapeMode(): boolean {
    return isInLandscapeMode();
}

export default useIsInLandscapeMode;
