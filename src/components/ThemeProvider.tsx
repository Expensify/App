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
        /*
         * For static themes we don't want to apply the autofill input style globally
         * SignInPageLayout uses static theme and handles this differently.
         */
        if (staticThemePreference) {
            return;
        }
        DomUtils.addCSS(DomUtils.getAutofilledInputStyle(theme.text), 'autofill-input');

        // staticThemePreference as it is a property that does not change we don't need it in the dependency array
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [theme.text]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export default ThemeProvider;
