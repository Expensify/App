import React from 'react';
import darkTheme from './default';
import {type ThemeColors} from './types';

const ThemeContext = React.createContext<ThemeColors>(darkTheme);

export default ThemeContext;
