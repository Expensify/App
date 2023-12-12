import React from 'react';
import {defaultTheme} from './themes';
import {type ThemeColors} from './types';

const ThemeContext = React.createContext<ThemeColors>(defaultTheme);

export default ThemeContext;
