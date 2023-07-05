/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import ThemeContext from './ThemeContext';
import useThemePreference from './useThemePreference';

// Going to eventually import the light theme here too
import darkTheme from './default';

const propTypes = {
    children: PropTypes.node.isRequired,
};

function ThemeProvider(props) {
    const themePreference = useThemePreference();

    const theme = useMemo(() => (themePreference === 'light' ? lightTheme : darkTheme), [themePreference]);

    return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = propTypes;
ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
