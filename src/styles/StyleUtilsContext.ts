import React from 'react';
import {StyleUtilsWithoutThemeParameters} from './StyleUtils';

const StyleUtilsContext = React.createContext<StyleUtilsWithoutThemeParameters | undefined>(undefined);

export default StyleUtilsContext;
