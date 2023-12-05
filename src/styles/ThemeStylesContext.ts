import React from 'react';
import defaultStyles, {ThemeStyles} from './styles';

const ThemeStylesContext = React.createContext<ThemeStyles>(defaultStyles);

export default ThemeStylesContext;
