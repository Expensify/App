import React from 'react';
import defaultStyles, {ThemeStyles} from './styles';
import {ThemeStyleUtilsType} from './utils/ThemeStyleUtils';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    ThemeStyleUtils: ThemeStyleUtilsType;
};

const defaultThemeStyles = new Proxy(
    {},
    {
        get() {
            return () => undefined;
        },
    },
);

const ThemeStylesContext = React.createContext<ThemeStylesContextType | undefined>({styles: defaultStyles, ThemeStyleUtils: defaultThemeStyles as ThemeStyleUtilsType});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
