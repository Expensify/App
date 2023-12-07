import React from 'react';
import {defaultStyles} from '@styles/styles';
import type {ThemeStyles} from '@styles/styles';
import {DefaultStyleUtils} from '@styles/utils';
import type {StyleUtilsType} from '@styles/utils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    StyleUtils: StyleUtilsType;
};

const ThemeStylesContext = React.createContext<ThemeStylesContextType>({styles: defaultStyles, StyleUtils: DefaultStyleUtils});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
