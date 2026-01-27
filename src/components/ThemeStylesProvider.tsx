import React, {useMemo} from 'react';
import useTheme from '@hooks/useTheme';
// eslint-disable-next-line no-restricted-imports
import styles from '@styles/index';
import ThemeStylesContext from '@styles/theme/context/ThemeStylesContext';
// eslint-disable-next-line no-restricted-imports
import createStyleUtils from '@styles/utils';

type ThemeStylesProviderProps = React.PropsWithChildren;

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();

    const themeStyles = useMemo(() => styles(theme), [theme]);
    const StyleUtils = useMemo(() => createStyleUtils(theme, themeStyles), [theme, themeStyles]);
    const contextValue = useMemo(() => ({styles: themeStyles, StyleUtils}), [themeStyles, StyleUtils]);

    return <ThemeStylesContext.Provider value={contextValue}>{children}</ThemeStylesContext.Provider>;
}

export default ThemeStylesProvider;
