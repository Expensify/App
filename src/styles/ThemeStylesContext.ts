import React from 'react';
import {ThemeStyles} from './styles';
import {ThemeStyleUtilsType} from './utils/ThemeStyleUtils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    ThemeStyleUtils: ThemeStyleUtilsType;
};

const ThemeStylesContext = React.createContext<ThemeStylesContextType | undefined>(undefined);

export default ThemeStylesContext;
export {type ThemeStylesContextType};
