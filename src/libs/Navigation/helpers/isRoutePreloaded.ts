import type {NavigationState} from '@react-navigation/native';
import {getRootTabScreenParam} from '@libs/Navigation/helpers/rootTabNavigatorUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, NavigationPartialRoute, RootTabNavigatorParamList} from '@libs/Navigation/types';

export default function isRoutePreloaded(routeName: keyof AuthScreensParamList | keyof RootTabNavigatorParamList) {
    if (!navigationRef.isReady()) {
        return false;
    }
    const rootState = navigationRef.getRootState() as NavigationState<AuthScreensParamList> & {preloadedRoutes: Array<NavigationPartialRoute<keyof AuthScreensParamList>>};
    return rootState.preloadedRoutes?.some((preloadedRoute) => {
        if (preloadedRoute.name === routeName) {
            return true;
        }
        return getRootTabScreenParam(preloadedRoute) === routeName;
    });
}
