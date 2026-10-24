import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * When the native tab bar has no Account item, the Account tab is drawn over the other tabs
 * as a full screen with the bar hidden, and it needs its own way back.
 */
function useIsSettingsDrawnOverTabs() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return shouldUseNarrowLayout;
}

export default useIsSettingsDrawnOverTabs;
