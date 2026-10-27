import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * The native tab bar has no Account item, so on narrow layouts Account is drawn over the other tabs
 * with the bar hidden and needs its own way back.
 */
function useIsSettingsDrawnOverTabs() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return shouldUseNarrowLayout;
}

export default useIsSettingsDrawnOverTabs;
