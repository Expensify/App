// eslint-disable-next-line no-restricted-imports
import {defaultIllustrations} from '@styles/theme/illustrations';
import type IllustrationsType from '@styles/theme/illustrations/types';

import React from 'react';

const ThemeIllustrationsContext = React.createContext<IllustrationsType>(defaultIllustrations);

export default ThemeIllustrationsContext;
