/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import useTheme from './themes/useTheme';
import ThemeStylesContext from './ThemeStylesContext';
// TODO: Rename this to "styles" once the styles are fully typed
import {stylesGenerator} from './styles';
import ThemeColors from './themes/ThemeColors';

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
