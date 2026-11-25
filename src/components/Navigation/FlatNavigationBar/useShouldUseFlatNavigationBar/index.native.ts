/** Native tablets render the same tab bar on wide, but the flat bar's popover anchors do not account for their safe area yet, so they keep the icon bar. */
function useShouldUseFlatNavigationBar() {
    return false;
}

export default useShouldUseFlatNavigationBar;
