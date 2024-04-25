import React from 'react';
import type {CentralPaneNavigatorParamList, NavigationPartialRoute} from '@libs/Navigation/types';

const ActiveRouteContext = React.createContext<NavigationPartialRoute<keyof CentralPaneNavigatorParamList> | undefined>(undefined);

export default ActiveRouteContext;
