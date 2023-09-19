/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import useTheme from './themes/useTheme';
import ThemeStylesContext from './ThemeStylesContext';
// TODO: Replace this import with "styles" once the static style export from "styles.js" isn't used anymore
import {stylesGenerator} from './styles';

type ThemeStylesProviderProps = {
    children: React.ReactNode;
};

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();

    const themeStyles = useMemo(() => stylesGenerator(theme), [theme]);

    return <ThemeStylesContext.Provider value={themeStyles}>{children}</ThemeStylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
