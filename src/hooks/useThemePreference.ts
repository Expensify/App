import {useColorScheme} from 'react-native';
import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useThemePreference(): ThemePreferenceWithoutSystem {
    const [preferredThemeFromStorage] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const systemTheme = useColorScheme();

    const theme = preferredThemeFromStorage ?? CONST.THEME.DEFAULT;

    if (theme === CONST.THEME.SYSTEM) {
        return systemTheme === 'dark' ? CONST.THEME.DARK : CONST.THEME.LIGHT;
    }

    if (theme === CONST.THEME.SYSTEM_CONTRAST) {
        return systemTheme === 'dark' ? CONST.THEME.DARK_CONTRAST : CONST.THEME.LIGHT_CONTRAST;
    }

    return theme as ThemePreferenceWithoutSystem;
}

export default useThemePreference;
