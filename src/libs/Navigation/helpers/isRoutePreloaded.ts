import type {NavigationState} from '@react-navigation/native';
import navigationRef from '@libs/Navigation/navigationRef';
import type {AuthScreensParamList, NavigationPartialRoute} from '@libs/Navigation/types';

export default function isRoutePreloaded(routeName: keyof AuthScreensParamList) {
    if (!navigationRef.isReady()) {
        return false;
    }
    const rootState = navigationRef.getRootState() as NavigationState<AuthScreensParamList> & {preloadedRoutes: Array<NavigationPartialRoute<keyof AuthScreensParamList>>};
    return rootState.preloadedRoutes.some((preloadedRoute) => preloadedRoute.name === routeName);
}
