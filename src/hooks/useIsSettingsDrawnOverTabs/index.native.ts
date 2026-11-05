import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * On narrow layouts, Account is drawn inside another tab without its own history,
 * so the Android back button needs its own way back.
 */
function useIsSettingsDrawnOverTabs() {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    return shouldUseNarrowLayout;
}

export default useIsSettingsDrawnOverTabs;
