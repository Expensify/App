import React from 'react';
import {defaultTheme} from '@styles/theme/themes';
import {type ThemeColors} from '@styles/theme/types';

const ThemeContext = React.createContext<ThemeColors>(defaultTheme);

export default ThemeContext;
