/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import CONST from '@src/CONST';
// Going to eventually import the light theme here too
import darkTheme from './default';
import ThemeContext from './ThemeContext';
import useThemePreference from './useThemePreference';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

function ThemeProvider(props) {
    const themePreference = useThemePreference();

    const theme = useMemo(() => (themePreference === CONST.THEME.LIGHT ? /* TODO: replace with light theme */ darkTheme : darkTheme), [themePreference]);

    return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = propTypes;
ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
