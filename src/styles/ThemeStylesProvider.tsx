/* eslint-disable react/jsx-props-no-spreading */
import React, {useMemo} from 'react';
import useTheme from './themes/useTheme';
import StylesContext from './ThemeStylesContext';
import defaultStyles from './styles';

type ThemeStylesProviderProps = {
    children: React.ReactNode;
};

function ThemeStylesProvider({children}: ThemeStylesProviderProps) {
    const theme = useTheme();

    const appContentStyle = useMemo(
        () => ({
            ...defaultStyles.appContent,
            backgroundColor: theme.appBG,
        }),
        [theme.appBG],
    );

    const styles = useMemo(
        () => ({
            ...defaultStyles,
            appContent: appContentStyle,
        }),
        [appContentStyle],
    );

    return <StylesContext.Provider value={styles}>{children}</StylesContext.Provider>;
}

ThemeStylesProvider.displayName = 'ThemeStylesProvider';

export default ThemeStylesProvider;
