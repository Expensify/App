import {useContext} from 'react';
import ActiveCentralPaneRouteContext from '@libs/Navigation/AppNavigator/Navigators/ActiveCentralPaneRouteContext';
import type {AuthScreensParamList, NavigationPartialRoute} from '@libs/Navigation/types';

function useActiveCentralPaneRoute(): NavigationPartialRoute<keyof AuthScreensParamList> | undefined {
    return useContext(ActiveCentralPaneRouteContext);
}

export default useActiveCentralPaneRoute;
