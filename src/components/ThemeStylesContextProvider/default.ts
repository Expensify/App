// eslint-disable-next-line no-restricted-imports
import {defaultStyles} from '@styles/index';
// eslint-disable-next-line no-restricted-imports
import {DefaultStyleUtils} from '@styles/utils';
import type {ThemeStylesActionsContextType, ThemeStylesStateContextType} from './types';

const defaultThemeStylesStateContextValue: ThemeStylesStateContextType = {
    styles: defaultStyles,
};

const defaultThemeStylesActionsContextValue: ThemeStylesActionsContextType = {
    StyleUtils: DefaultStyleUtils,
};

export {defaultThemeStylesStateContextValue, defaultThemeStylesActionsContextValue};
