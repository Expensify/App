import type {ThemeStyles} from '@styles/index';
import type {StyleUtilsType} from '@styles/utils';

type ThemeStylesStateContextType = {
    styles: ThemeStyles;
};

type ThemeStylesActionsContextType = {
    StyleUtils: StyleUtilsType;
};

export type {ThemeStylesStateContextType, ThemeStylesActionsContextType};
