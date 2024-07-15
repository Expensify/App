import React from 'react';
import type {BottomTabScreensParamList, NavigationPartialRoute} from '@libs/Navigation/types';

const ActiveBottomTabRouteContext = React.createContext<NavigationPartialRoute<keyof BottomTabScreensParamList> | undefined>(undefined);

export default ActiveBottomTabRouteContext;
