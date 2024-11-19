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

    /*
     * This effect is used to add the autofill input styles to the DOM depending on the theme
     * and clean up the theme when unmounting.
     * Each page that provides a ThemeProvider will add the autofill-input styles for their theme
     * and unmount theme when the page is unmounted.
     */
    useEffect(() => {
        const randomId = Math.random().toString(36).slice(2, 7);
        const styleid = `autofill-input-${randomId}`;

        DomUtils.addCSS(DomUtils.getAutofilledInputStyle(theme.text), styleid);
        return () => {
            DomUtils.removeCSS(styleid);
        };
    }, [theme.text]);

    return <ThemeStylesContext.Provider value={contextValue}>{children}</ThemeStylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
