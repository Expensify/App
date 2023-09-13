/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import useTheme from './themes/useTheme';
import StylesContext from './ThemeStylesContext';
import {styles as stylesUntyped} from './styles';

const styles = stylesUntyped as (theme: Record<string, string>) => Record<string, unknown>;

type ThemeStylesProviderProps = {
    children: React.ReactNode;
};

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();

    const themeStyles = useMemo(() => styles(theme), [theme]);

    return <StylesContext.Provider value={themeStyles}>{children}</StylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
