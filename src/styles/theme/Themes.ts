import CONST from '@src/CONST';
import darkTheme from './themes/dark';
import lightTheme from './themes/light';
import {type ThemeColors, ThemePreferenceWithoutSystem} from './types';

const Themes = {
    [CONST.THEME.LIGHT]: lightTheme,
    [CONST.THEME.DARK]: darkTheme,
} satisfies Record<ThemePreferenceWithoutSystem, ThemeColors>;

const defaultTheme = Themes[CONST.THEME.DEFAULT];

export default Themes;
export {defaultTheme};
