import CONST from '@src/CONST';
import darkTheme from './default';
import lightTheme from './light';
import {ThemeColors, ThemePreferenceWithoutSystem} from './types';

// There might be more themes than just "dark" and "light".
// Still, status bar, scrollbar and other components might need to adapt based on if the theme is overly light or dark
// e.g. the StatusBar displays either "light-content" or "dark-content" based on the theme
const Themes = {
    [CONST.THEME.LIGHT]: lightTheme,
    [CONST.THEME.DARK]: darkTheme,
} satisfies Record<ThemePreferenceWithoutSystem, ThemeColors>;

export default Themes;
