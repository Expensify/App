import CONST from '@src/CONST';
import darkTheme from './default';
import lightTheme from './light';
import {ThemeColors, ThemePreferenceWithoutSystem} from './types';

const Themes = {
    [CONST.THEME.LIGHT]: lightTheme,
    [CONST.THEME.DARK]: darkTheme,
} satisfies Record<ThemePreferenceWithoutSystem, ThemeColors>;

export default Themes;
