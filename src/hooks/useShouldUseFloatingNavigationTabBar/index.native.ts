/**
 * The floating tab bar is a mobile web only treatment. Native keeps the full-width bottom bar in landscape.
 */
function useShouldUseFloatingNavigationTabBar(): boolean {
    return false;
}

export default useShouldUseFloatingNavigationTabBar;
