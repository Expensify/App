import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {defaultStyles} from '@styles/index';
import type {ThemeStyles} from '@styles/index';
// eslint-disable-next-line no-restricted-imports
import {DefaultStyleUtils} from '@styles/utils';
import type {StyleUtilsType} from '@styles/utils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    StyleUtils: StyleUtilsType;
};

const ThemeStylesContext = React.createContext<ThemeStylesContextType>({styles: defaultStyles, StyleUtils: DefaultStyleUtils});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
