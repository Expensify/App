import React from 'react';
import defaultStyles, {ThemeStyles} from './styles';
import {StyleUtilsType} from './StyleUtils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    StyleUtils: StyleUtilsType;
};

const defaultThemeStyles = new Proxy(
    {},
    {
        get() {
            return () => undefined;
        },
    },
);

const ThemeStylesContext = React.createContext<ThemeStylesContextType | undefined>({styles: defaultStyles, StyleUtils: defaultThemeStyles as StyleUtilsType});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
