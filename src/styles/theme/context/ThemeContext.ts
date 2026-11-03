import type {ThemeColors} from '@styles/theme/types';

import React from 'react';

import {defaultTheme} from '..';

const ThemeContext = React.createContext<ThemeColors>(defaultTheme);

export default ThemeContext;
