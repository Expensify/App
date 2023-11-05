/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import {stylesGenerator} from './styles';
import useTheme from './themes/useTheme';
import ThemeStylesContext from './ThemeStylesContext';

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
