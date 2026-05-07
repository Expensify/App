import styles from '@src/styles';
import {defaultTheme} from '@src/styles/theme';
import createStyleUtils from '@src/styles/utils';
import type {ThemeStylesActionsContextType, ThemeStylesStateContextType} from './types';

// Lazy defaults: defers the expensive styles(defaultTheme) call from module import
// time to first access. In production, ThemeStylesProvider supplies real values so
// these are never reached. Tests that render without the provider will trigger lazy
// initialization on first access.
let cachedState: ThemeStylesStateContextType | undefined;
let cachedActions: ThemeStylesActionsContextType | undefined;

const defaultThemeStylesStateContextValue = new Proxy({} as ThemeStylesStateContextType, {
    get(_, prop: keyof ThemeStylesStateContextType) {
        if (!cachedState) {
            cachedState = {styles: styles(defaultTheme)};
        }
        return cachedState[prop];
    },
});

const defaultThemeStylesActionsContextValue = new Proxy({} as ThemeStylesActionsContextType, {
    get(_, prop: keyof ThemeStylesActionsContextType) {
        if (!cachedActions) {
            if (!cachedState) {
                cachedState = {styles: styles(defaultTheme)};
            }
            cachedActions = {StyleUtils: createStyleUtils(defaultTheme, cachedState.styles)};
        }
        return cachedActions[prop];
    },
});

export {defaultThemeStylesStateContextValue, defaultThemeStylesActionsContextValue};
