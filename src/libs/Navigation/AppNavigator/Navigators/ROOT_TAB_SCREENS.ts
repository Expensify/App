import SCREENS from '@src/SCREENS';

/**
 * Leaf screen names that represent the root/landing view of each tab.
 * A route whose focused leaf is in this set is considered "at the tab's root"
 * — used by TabNavigatorBar to decide tab-bar visibility, and by linkTo to
 * distinguish plain tab switches from cross-tab deep navigations.
 */
const ROOT_TAB_SCREENS = new Set<string>([
    SCREENS.HOME,
    SCREENS.INBOX,
    SCREENS.SEARCH.ROOT,
    SCREENS.SETTINGS.ROOT,
    SCREENS.WORKSPACES_LIST,
    SCREENS.WORKSPACE.INITIAL,
    SCREENS.DOMAIN.INITIAL,
]);

export default ROOT_TAB_SCREENS;
