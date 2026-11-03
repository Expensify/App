import type {ColorScheme} from '@styles/index';

import CONST from '@src/CONST';

import {DarkTheme, DefaultTheme} from '@react-navigation/native';

/**
 * Resolves the app theme's color scheme to the matching react-navigation base theme.
 *
 * Takes `theme.colorScheme` from `useTheme()` rather than the raw theme preference: the app theme switches after a
 * debounce, and the native tab bar reads its color scheme from the navigation theme, so both must switch together.
 *
 * Use this helper anywhere a `NavigationContainer` / `BaseNavigationContainer`
 * needs a `theme` prop so the choice stays consistent across every navigator.
 */
function getNavigationBaseTheme(colorScheme: ColorScheme): typeof DarkTheme | typeof DefaultTheme {
    return colorScheme === CONST.COLOR_SCHEME.DARK ? DarkTheme : DefaultTheme;
}

export default getNavigationBaseTheme;
