import React, {useMemo} from 'react';
import {stylesGenerator} from './styles';
import createThemeStyleUtils from './StyleUtils';
import useTheme from './themes/useTheme';
import ThemeStylesContext from './ThemeStylesContext';

type ThemeStylesProviderProps = React.PropsWithChildren;

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();

    const styles = useMemo(() => stylesGenerator(theme), [theme]);
    const ThemeStyleUtils = useMemo(() => createThemeStyleUtils(theme, styles), [theme, styles]);
    const contextValue = useMemo(() => ({styles, ThemeStyleUtils}), [styles, ThemeStyleUtils]);

    return <ThemeStylesContext.Provider value={contextValue}>{children}</ThemeStylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
