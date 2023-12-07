import React from 'react';
import {DefaultIllustrations} from './Illustrations';
import {IllustrationsType} from './types';

const ThemeIllustrationsContext = React.createContext<IllustrationsType>(DefaultIllustrations);

export default ThemeIllustrationsContext;
