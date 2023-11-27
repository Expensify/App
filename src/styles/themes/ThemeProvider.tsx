/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import ThemeContext from './ThemeContext';
import Themes from './Themes';
import {ThemePreferenceWithoutSystem} from './types';
import useThemePreference from './useThemePreference';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

type ThemeProviderProps = React.PropsWithChildren & {
    theme?: ThemePreferenceWithoutSystem;
};

function ThemeProvider({children, theme: staticThemePreference}: ThemeProviderProps) {
    const dynamicThemePreference = useThemePreference();

    // If the "theme" prop is provided, we'll want to use a hardcoded/static theme instead of the currently selected dynamic theme
    // This is used for example on the "SignInPage", because it should always display in dark mode.
    const themePreference = staticThemePreference ?? dynamicThemePreference;
    const theme = useMemo(() => Themes[themePreference], [themePreference]);

    return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = propTypes;
ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
