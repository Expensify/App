/**
 * Ordered list of screen names registered inside TabNavigator.
 * This must match the Tab.Screen order in TabNavigator.tsx. TabNavigator.native.tsx keeps the same relative order and
 * adds item-only routes for its tab bar, which state built from this list picks up on rehydration.
 * Used by getAdaptedStateFromPath to build complete tab navigator state for deep-links.
 */
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

const TAB_SCREENS = [
    SCREENS.HOME,
    NAVIGATORS.REPORTS_SPLIT_NAVIGATOR,
    NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR,
    SCREENS.INSIGHTS,
    SCREENS.MORE,
    NAVIGATORS.WORKSPACE_NAVIGATOR,
    NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR,
] as const;

export default TAB_SCREENS;
