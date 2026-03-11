// This component is compiled by the React Compiler
/* eslint-disable react/jsx-no-constructed-context-values */
import React, {createContext, useContext} from 'react';
import useTheme from '@hooks/useTheme';
// eslint-disable-next-line no-restricted-imports
import styles from '@styles/index';
// eslint-disable-next-line no-restricted-imports
import createStyleUtils from '@styles/utils';
import {defaultThemeStylesActionsContextValue, defaultThemeStylesStateContextValue} from './default';
import type {ThemeStylesActionsContextType, ThemeStylesStateContextType} from './types';

const ThemeStylesStateContext = createContext<ThemeStylesStateContextType>(defaultThemeStylesStateContextValue);
const ThemeStylesActionsContext = createContext<ThemeStylesActionsContextType>(defaultThemeStylesActionsContextValue);

function ThemeStylesProvider({children}: React.PropsWithChildren) {
    const theme = useTheme();

    const themeStyles = styles(theme);
    const StyleUtils = createStyleUtils(theme, themeStyles);

    const stateValue = {styles: themeStyles};
    const actionsValue = {StyleUtils};

    return (
        <ThemeStylesStateContext.Provider value={stateValue}>
            <ThemeStylesActionsContext.Provider value={actionsValue}>{children}</ThemeStylesActionsContext.Provider>
        </ThemeStylesStateContext.Provider>
    );
}

function useThemeStylesState() {
    return useContext(ThemeStylesStateContext);
}

function useThemeStylesActions() {
    return useContext(ThemeStylesActionsContext);
}

export default ThemeStylesProvider;
export {ThemeStylesStateContext, ThemeStylesActionsContext, useThemeStylesState, useThemeStylesActions};
export type {ThemeStylesStateContextType, ThemeStylesActionsContextType};
