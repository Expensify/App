import {useContext} from 'react';
import ActiveRouteContext from '@libs/Navigation/AppNavigator/Navigators/ActiveRouteContext';
import type {CentralPaneNavigatorParamList, NavigationPartialRoute} from '@libs/Navigation/types';

function useActiveRoute(): NavigationPartialRoute<keyof CentralPaneNavigatorParamList> | undefined {
    return useContext(ActiveRouteContext);
}

export default useActiveRoute;
