import React from 'react';
import styles from './styles';
import {defaultTheme} from './theme/Themes';

const defaultStyles = styles(defaultTheme);

const ThemeStylesContext = React.createContext(defaultStyles);

export default ThemeStylesContext;
