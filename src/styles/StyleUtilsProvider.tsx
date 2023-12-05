import React, {useMemo} from 'react';
import {createStyleUtilsWithoutThemeParameters} from './StyleUtils';
import StyleUtilsContext from './StyleUtilsContext';
import useTheme from './themes/useTheme';
import useThemeStyles from './useThemeStyles';

type ThemeStylesProviderProps = React.PropsWithChildren;

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const StyleUtils = useMemo(() => createStyleUtilsWithoutThemeParameters(theme, styles), [theme, styles]);

    return <StyleUtilsContext.Provider value={StyleUtils}>{children}</StyleUtilsContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
