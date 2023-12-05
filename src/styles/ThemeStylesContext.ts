import React from 'react';
import defaultStyles, {ThemeStyles} from './styles';
import createStyleUtils, {StyleUtilsType} from './StyleUtils';
import darkTheme from './themes/default';

type ThemeStylesContextType = {
    styles: ThemeStyles;
    StyleUtils: StyleUtilsType;
};

const DefaultStyleUtils = createStyleUtils(darkTheme, defaultStyles);

const ThemeStylesContext = React.createContext<ThemeStylesContextType>({styles: defaultStyles, StyleUtils: DefaultStyleUtils});

export default ThemeStylesContext;
export {type ThemeStylesContextType};
