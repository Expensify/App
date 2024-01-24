import {useContext, useState, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {PreferredThemeContext} from '@components/OnyxProvider';
import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';
import CONST from '@src/CONST';

function useThemePreference() {
    const preferredThemeFromStorage = useContext(PreferredThemeContext);
    const systemTheme = useColorScheme();
  
    const themePreference = useMemo(() => {
      const theme = preferredThemeFromStorage ?? CONST.THEME.DEFAULT;
  
      // If the user chooses to use the device theme settings, set the theme preference to the system theme
      if (theme === CONST.THEME.SYSTEM) {
        return systemTheme ?? CONST.THEME.FALLBACK;
      } else {
        return theme;
      }
    }, [preferredThemeFromStorage, systemTheme]);
  
    return themePreference;
  }

export default useThemePreference;
