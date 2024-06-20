import CONST from '@src/CONST';
import darkTheme from './themes/dark';
import lightTheme from './themes/light';
import type {ThemeColors, ThemePreferenceWithoutSystem} from './types';

const themes = {
    [CONST.THEME.LIGHT]: lightTheme,
    [CONST.THEME.DARK]: darkTheme,
} satisfies Record<ThemePreferenceWithoutSystem, ThemeColors>;

const defaultTheme = themes[CONST.THEME.FALLBACK];

export default themes;
export {defaultTheme};
