// eslint-disable-next-line no-restricted-imports
import styles from '@styles/index';
// eslint-disable-next-line no-restricted-imports
import {defaultTheme} from '@styles/theme';
// eslint-disable-next-line no-restricted-imports
import createStyleUtils from '@styles/utils';
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
            const defaultStyles = styles(defaultTheme);
            cachedActions = {StyleUtils: createStyleUtils(defaultTheme, defaultStyles)};
        }
        return cachedActions[prop];
    },
});

export {defaultThemeStylesStateContextValue, defaultThemeStylesActionsContextValue};
