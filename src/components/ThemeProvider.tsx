import React, {useEffect, useMemo} from 'react';
import useDebouncedState from '@hooks/useDebouncedState';
import useThemePreferenceWithStaticOverride from '@hooks/useThemePreferenceWithStaticOverride';
import DomUtils from '@libs/DomUtils';
// eslint-disable-next-line no-restricted-imports
import themes from '@styles/theme';
import ThemeContext from '@styles/theme/context/ThemeContext';
import type {ThemePreferenceWithoutSystem} from '@styles/theme/types';

type ThemeProviderProps = React.PropsWithChildren & {
    theme?: ThemePreferenceWithoutSystem;
};

function ThemeProvider({children, theme: staticThemePreference}: ThemeProviderProps) {
    const themePreference = useThemePreferenceWithStaticOverride(staticThemePreference);
    const [, debouncedTheme, setDebouncedTheme] = useDebouncedState(themePreference);

    useEffect(() => {
        setDebouncedTheme(themePreference);
    }, [setDebouncedTheme, themePreference]);

    const theme = useMemo(() => themes[debouncedTheme], [debouncedTheme]);

    useEffect(() => {
        DomUtils.addCSS(DomUtils.getAutofilledInputStyle(theme.text), 'autofill-input');
    }, [theme.text]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
