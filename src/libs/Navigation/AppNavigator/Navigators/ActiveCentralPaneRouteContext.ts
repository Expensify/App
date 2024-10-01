import React from 'react';
import type {AuthScreensParamList, NavigationPartialRoute} from '@libs/Navigation/types';

const ActiveCentralPaneRouteContext = React.createContext<NavigationPartialRoute<keyof AuthScreensParamList> | undefined>(undefined);

export default ActiveCentralPaneRouteContext;
