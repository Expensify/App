import React from 'react';
import {defaultStyles} from './styles';
import type {ThemeStyles} from './styles';
import {DefaultStyleUtils} from './StyleUtils';
import type {StyleUtilsType} from './StyleUtils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    StyleUtils: StyleUtilsType;
};

const ThemeStylesContext = React.createContext<ThemeStylesContextType>({styles: defaultStyles, StyleUtils: DefaultStyleUtils});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
