/* eslint-disable react/jsx-props-no-spreading */
import PropTypes from 'prop-types';
import React, {useMemo} from 'react';
import CONST from '@src/CONST';
import darkTheme from './default';
import lightTheme from './light';
import ThemeContext from './ThemeContext';
import useThemePreference from './useThemePreference';

const propTypes = {
    /** Rendered child component */
    children: PropTypes.node.isRequired,
};

function ThemeProvider(props: React.PropsWithChildren) {
    const themePreference = useThemePreference();

    const theme = useMemo(() => (themePreference === CONST.THEME.LIGHT ? lightTheme : darkTheme), [themePreference]);

    return <ThemeContext.Provider value={theme}>{props.children}</ThemeContext.Provider>;
}

ThemeProvider.propTypes = propTypes;
ThemeProvider.displayName = 'ThemeProvider';

export default ThemeProvider;
