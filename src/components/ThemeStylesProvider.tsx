import React, {useEffect, useMemo} from 'react';
import useTheme from '@hooks/useTheme';
import DomUtils from '@libs/DomUtils';
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

    useEffect(() => {
        DomUtils.addCSS(DomUtils.getAutofilledInputStyle(theme.text), 'autofill-input');
    }, [theme.text]);

    return <ThemeStylesContext.Provider value={contextValue}>{children}</ThemeStylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
