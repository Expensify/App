/**
 * Ordered list of screen names registered inside RootTabNavigator.
 * This must match the Tab.Screen order in RootTabNavigator.tsx.
 * Used by getAdaptedStateFromPath to build complete tab navigator state for deep-links.
 */
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const ROOT_TAB_SCREENS = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    SCREENS.WORKSPACES_LIST,
    NAVIGATORS.WORKSPACE_SPLIT_NAVIGATOR,
    NAVIGATORS.DOMAIN_SPLIT_NAVIGATOR,
] as const;

export default ROOT_TAB_SCREENS;
