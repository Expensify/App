import useIsInLandscapeMode from '@hooks/useIsInLandscapeMode';

/**
 * Used to apply web landscape treatments that do not apply on native, which has more vertical space.
 */
function useIsMobileWebLandscape(): boolean {
    return useIsInLandscapeMode();
}

export default useIsMobileWebLandscape;
