import React from 'react';
import styles from './styles';

const ThemeStylesContext = React.createContext<typeof styles>(styles);

export default ThemeStylesContext;
