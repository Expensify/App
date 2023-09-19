/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import useTheme from './themes/useTheme';
import ThemeStylesContext from './ThemeStylesContext';
// TODO: Rename this to "styles" once the styles are fully typed
import {stylesGenerator as stylesUntyped} from './styles';
import ThemeColors from './themes/ThemeColors';

// TODO: Remove this once the styles are fully typed
const styles = stylesUntyped as (theme: ThemeColors) => Record<string, unknown>;

type ThemeStylesProviderProps = {
    children: React.ReactNode;
};

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();

    const themeStyles = useMemo(() => styles(theme), [theme]);

    return <ThemeStylesContext.Provider value={themeStyles}>{children}</ThemeStylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
