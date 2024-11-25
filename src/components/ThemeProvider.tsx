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

    /*
     * This effect is used to add the autofill input styles to the DOM depending on the theme of the page.
     * Each page that provides a static ThemeProvider will add the autofill-input styles in a way that works for them
     * Check SignInPageLayout as an example for a  static theme provider

     */
    useEffect(() => {
        if (staticThemePreference) {
            return;
        }
        DomUtils.addCSS(DomUtils.getAutofilledInputStyle(theme.text), 'autofill-input');
    }, [staticThemePreference, theme.text]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
