import {useMemo} from 'react';
import {useColorScheme} from 'react-native';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useThemePreference() {
    const [preferredThemeFromStorage] = useOnyx(ONYXKEYS.PREFERRED_THEME);
    const systemTheme = useColorScheme();

    const themePreference = useMemo(() => {
        const theme = preferredThemeFromStorage ?? CONST.THEME.DEFAULT;

        // If the user chooses to use the device theme settings, set the theme preference to the system theme
        return theme === CONST.THEME.SYSTEM ? (systemTheme ?? CONST.THEME.FALLBACK) : theme;
    }, [preferredThemeFromStorage, systemTheme]);

    return themePreference;
}

export default useThemePreference;
