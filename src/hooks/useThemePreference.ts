import {useContext, useEffect, useState} from 'react';
import {useColorScheme} from 'react-native';
import {PreferredThemeContext} from '@components/OnyxProvider';
import {ThemePreferenceWithoutSystem} from '@styles/theme/types';
import CONST from '@src/CONST';

function useThemePreference() {
    const [themePreference, setThemePreference] = useState<ThemePreferenceWithoutSystem>(CONST.THEME.FALLBACK);
    const preferredThemeFromStorage = useContext(PreferredThemeContext);
    const systemTheme = useColorScheme();

    useEffect(() => {
        const theme = preferredThemeFromStorage ?? CONST.THEME.DEFAULT;

        // If the user chooses to use the device theme settings, we need to set the theme preference to the system theme
        if (theme === CONST.THEME.SYSTEM) {
            setThemePreference(systemTheme ?? CONST.THEME.FALLBACK);
        } else {
            setThemePreference(theme);
        }
    }, [preferredThemeFromStorage, systemTheme]);

    return themePreference;
}

export default useThemePreference;
