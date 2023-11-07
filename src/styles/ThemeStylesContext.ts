import React from 'react';
import styles, {type Styles} from './styles';

const ThemeStylesContext = React.createContext<Styles>(styles);

export default ThemeStylesContext;
