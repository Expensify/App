/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import PropTypes from 'prop-types';
import ThemeContext from './ThemeContext';
import useThemePreference from './useThemePreference';
import CONST from '../../CONST';
import darkTheme from './dark';
import lightTheme from './light';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

function ThemeProvider(props) {
    const themePreference = useThemePreference();

    const theme = useMemo(() => (themePreference === CONST.THEME.LIGHT ? lightTheme : darkTheme), [themePreference]);

    return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = propTypes;
ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
