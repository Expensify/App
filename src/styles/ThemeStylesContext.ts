import React from 'react';
import styles from './styles';
import defaultColors from './themes/default';

const ThemeStylesContext = React.createContext(styles(defaultColors));

export default ThemeStylesContext;
