import useResponsiveLayout from '@hooks/useResponsiveLayout';

/**
 * Whether the navigation tab bar should render as a compact pill floating in the bottom-left corner
 * instead of the full-width bottom bar. `isInLandscapeMode` is already false on desktop browsers and
 * tablets (see @libs/isInLandscapeMode), so this is effectively "mobile web phone, in landscape".
 */
function useShouldUseFloatingNavigationTabBar(): boolean {
    const {isInLandscapeMode} = useResponsiveLayout();

    return isInLandscapeMode;
}

export default useShouldUseFloatingNavigationTabBar;
