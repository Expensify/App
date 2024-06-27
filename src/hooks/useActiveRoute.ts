import {useContext} from 'react';
import ActiveRouteContext from '@libs/Navigation/AppNavigator/Navigators/ActiveRouteContext';
import type {AuthScreensParamList, NavigationPartialRoute} from '@libs/Navigation/types';

function useActiveRoute(): NavigationPartialRoute<keyof AuthScreensParamList> | undefined {
    return useContext(ActiveRouteContext);
}

export default useActiveRoute;
