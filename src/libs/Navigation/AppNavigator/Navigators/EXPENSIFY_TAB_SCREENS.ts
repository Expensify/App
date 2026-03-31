/**
 * Ordered list of screen names registered inside ExpensifyTabNavigator.
 * This must match the Tab.Screen order in ExpensifyTabNavigator.tsx.
 * Used by getAdaptedStateFromPath to build complete tab navigator state for deep-links.
 */
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const EXPENSIFY_TAB_SCREENS = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
] as const;

export default EXPENSIFY_TAB_SCREENS;
