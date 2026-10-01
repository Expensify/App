/**
 * The tab bar never floats on native (see useIsMobileWebLandscape), so there is no keyboard state to track: subscribing
 * to it here would only re-render the tab bar on every keyboard toggle for a result that is always false.
 */
function useIsFloatingTabBarHiddenForKeyboard(): boolean {
    return false;
}

export default useIsFloatingTabBarHiddenForKeyboard;
