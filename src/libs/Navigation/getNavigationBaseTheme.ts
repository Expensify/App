import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';
import {getBaseTheme} from '@styles/theme/utils';

import CONST from '@src/CONST';

import {DarkTheme, DefaultTheme} from '@react-navigation/native';

/**
 * Resolves a user's theme preference to the matching react-navigation base theme.
 *
 * `CONST.THEME` covers more than just `dark` / `light` — high-contrast and system
 * variants exist as well. A naive `themePreference === CONST.THEME.DARK` check
 * mis-buckets every non-DARK variant (e.g. `dark-contrast`) into the light base.
 * Callers must go through `getBaseTheme()` so contrast and system variants
 * resolve to their underlying DARK/LIGHT base first.
 *
 * Use this helper anywhere a `NavigationContainer` / `BaseNavigationContainer`
 * needs a `theme` prop so the choice stays consistent across every navigator.
 */
function getNavigationBaseTheme(themePreference: ThemePreferenceWithoutSystem): typeof DarkTheme | typeof DefaultTheme {
    return getBaseTheme(themePreference) === CONST.THEME.DARK ? DarkTheme : DefaultTheme;
}

export default getNavigationBaseTheme;
