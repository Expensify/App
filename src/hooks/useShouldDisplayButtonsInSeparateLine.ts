import useResponsiveLayout from './useResponsiveLayout';

/**
 * Returns true if the buttons should be shown in a separate line (mobile in portrait mode)
 * Returns false if the buttons should be shown in the same row as other elements, for example header buttons in the header row (desktop + mobile in landscape mode)
 */
function useShouldDisplayButtonsInSeparateLine() {
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    return shouldUseNarrowLayout && !isInLandscapeMode;
}

export default useShouldDisplayButtonsInSeparateLine;
