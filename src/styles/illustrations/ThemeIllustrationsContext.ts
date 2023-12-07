import React from 'react';
import DarkIllustrations from './dark';
import {Illustrations} from './types';

const ThemeIllustrationsContext = React.createContext<Illustrations>(DarkIllustrations);

export default ThemeIllustrationsContext;
