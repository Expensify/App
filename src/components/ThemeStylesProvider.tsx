import React, {useMemo} from 'react';
import useTheme from '@hooks/useTheme';
import stylesGenerator from '@styles/index';
import ThemeStylesContext from '@styles/theme/context/ThemeStylesContext';
import createStyleUtils from '@styles/utils';

type ThemeStylesProviderProps = React.PropsWithChildren;

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();

    const styles = useMemo(() => stylesGenerator(theme), [theme]);
    const StyleUtils = useMemo(() => createStyleUtils(theme, styles), [theme, styles]);
    const contextValue = useMemo(() => ({styles, StyleUtils}), [styles, StyleUtils]);

    return <ThemeStylesContext.Provider value={contextValue}>{children}</ThemeStylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
