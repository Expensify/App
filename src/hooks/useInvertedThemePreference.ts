import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';

import CONST from '@src/CONST';

import useThemePreference from './useThemePreference';

const INVERTED_THEMES: Record<ThemePreferenceWithoutSystem, ThemePreferenceWithoutSystem> = {
    [CONST.THEME.LIGHT]: CONST.THEME.DARK,
    [CONST.THEME.DARK]: CONST.THEME.LIGHT,
    [CONST.THEME.LIGHT_CONTRAST]: CONST.THEME.DARK_CONTRAST,
    [CONST.THEME.DARK_CONTRAST]: CONST.THEME.LIGHT_CONTRAST,
};

/**
 * The opposite of the theme the app is currently showing, for a surface that is meant to stand out against the page
 * behind it. The user's contrast preference is carried across, so a contrast theme inverts to the other contrast theme.
 *
 * Pass the result to `<ThemeProvider theme={...}>` to render a subtree inverted, which colors everything inside it —
 * including popovers, which read the theme themselves and so cannot be inverted with style props.
 */
function useInvertedThemePreference(): ThemePreferenceWithoutSystem {
    return INVERTED_THEMES[useThemePreference()];
}

export default useInvertedThemePreference;
