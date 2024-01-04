import React from 'react';
import {DefaultIllustrations} from '@styles/theme/illustrations';
import type {IllustrationsType} from '@styles/theme/illustrations/types';

const ThemeIllustrationsContext = React.createContext<IllustrationsType>(DefaultIllustrations);

export default ThemeIllustrationsContext;
