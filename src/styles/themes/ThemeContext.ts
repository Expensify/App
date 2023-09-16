import React from 'react';
import darkTheme from './default';
import ThemeColors from './ThemeColors';

const ThemeContext = React.createContext<ThemeColors>(darkTheme);

export default ThemeContext;
