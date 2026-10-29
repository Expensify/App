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

function getDefaultState(): ThemeStylesStateContextType {
    if (!cachedState) {
        cachedState = {styles: styles(defaultTheme)};
    }
    return cachedState;
}

const defaultThemeStylesStateContextValue: ThemeStylesStateContextType = {
    get styles() {
        return getDefaultState().styles;
    },
};

const defaultThemeStylesActionsContextValue: ThemeStylesActionsContextType = {
    get StyleUtils() {
        if (!cachedActions) {
            cachedActions = {StyleUtils: createStyleUtils(defaultTheme, getDefaultState().styles)};
        }
        return cachedActions.StyleUtils;
    },
};

export {defaultThemeStylesStateContextValue, defaultThemeStylesActionsContextValue};
