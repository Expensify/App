import React from 'react';
import {ThemeStyles} from './styles';
import {StyleUtilsWithoutThemeParams} from './StyleUtils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    StyleUtils: StyleUtilsWithoutThemeParams;
};

const ThemeStylesContext = React.createContext<ThemeStylesContextType | undefined>(undefined);

export default ThemeStylesContext;
export {type ThemeStylesContextType};
