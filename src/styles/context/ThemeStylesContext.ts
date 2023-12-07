import React from 'react';
import {defaultStyles} from '@styles/index';
import type {ThemeStyles} from '@styles/index';
import {DefaultStyleUtils} from '@styles/utils';
import type {StyleUtilsType} from '@styles/utils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    StyleUtils: StyleUtilsType;
};

const ThemeStylesContext = React.createContext<ThemeStylesContextType>({styles: defaultStyles, StyleUtils: DefaultStyleUtils});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
