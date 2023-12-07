import React from 'react';
import {DefaultIllustrations} from '@styles/illustrations/illustrations';
import {IllustrationsType} from '@styles/illustrations/types';

const ThemeIllustrationsContext = React.createContext<IllustrationsType>(DefaultIllustrations);

export default ThemeIllustrationsContext;
