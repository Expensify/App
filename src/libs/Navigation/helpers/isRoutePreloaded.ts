import type {NavigationState} from '@react-navigation/native';
import {getExpensifyTabScreenParam} from '@libs/Navigation/helpers/expensifyTabNavigatorUtils';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, NavigationPartialRoute, ExpensifyTabNavigatorParamList} from '@libs/Navigation/types';

export default function isRoutePreloaded(routeName: keyof AuthScreensParamList | keyof ExpensifyTabNavigatorParamList) {
    if (!navigationRef.isReady()) {
        return false;
    }
    const rootState = navigationRef.getRootState() as NavigationState<AuthScreensParamList> & {preloadedRoutes: Array<NavigationPartialRoute<keyof AuthScreensParamList>>};
    return rootState.preloadedRoutes?.some((preloadedRoute) => {
        if (preloadedRoute.name === routeName) {
            return true;
        }
        return getExpensifyTabScreenParam(preloadedRoute) === routeName;
    });
}
