import type {NavigationState} from '@react-navigation/native';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, NavigationPartialRoute, RootTabNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

export default function isRoutePreloaded(routeName: keyof AuthScreensParamList | keyof RootTabNavigatorParamList) {
    if (!navigationRef.isReady()) {
        return false;
    }
    const rootState = navigationRef.getRootState() as NavigationState<AuthScreensParamList> & {preloadedRoutes: Array<NavigationPartialRoute<keyof AuthScreensParamList>>};
    return rootState.preloadedRoutes?.some((preloadedRoute) => {
        if (preloadedRoute.name === routeName) {
            return true;
        }
        if (preloadedRoute.name === NAVIGATORS.ROOT_TAB_NAVIGATOR && preloadedRoute.params && 'screen' in preloadedRoute.params) {
            return (preloadedRoute.params as {screen: keyof RootTabNavigatorParamList}).screen === routeName;
        }
        return false;
    });
}
