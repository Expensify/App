import CONST from '@src/CONST';
import darkTheme from './themes/dark';
import darkContrastTheme from './themes/dark-contrast';
import lightTheme from './themes/light';
import lightContrastTheme from './themes/light-contrast';
import type {ThemeColors, ThemePreferenceWithoutSystem} from './types';

const themes = {
    [CONST.THEME.LIGHT]: lightTheme,
    [CONST.THEME.DARK]: darkTheme,
    [CONST.THEME.LIGHT_CONTRAST]: lightContrastTheme,
    [CONST.THEME.DARK_CONTRAST]: darkContrastTheme,
} satisfies Record<ThemePreferenceWithoutSystem, ThemeColors>;

const defaultTheme = themes[CONST.THEME.FALLBACK];

export default themes;
export {defaultTheme};
