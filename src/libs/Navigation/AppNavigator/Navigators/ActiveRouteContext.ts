import React from 'react';
import type {AuthScreensParamList, NavigationPartialRoute} from '@libs/Navigation/types';

const ActiveRouteContext = React.createContext<NavigationPartialRoute<keyof AuthScreensParamList> | undefined>(undefined);

export default ActiveRouteContext;
