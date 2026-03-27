import type {NavigationState} from '@react-navigation/native';
import type {NavigationPartialRoute, RootTabNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

type RootTabState = {
    routes: Array<{name: string; key?: string; state?: NavigationState}>;
    index?: number;
};

/**
 * Extracts the tab navigator state from a ROOT_TAB_NAVIGATOR route.
 * Returns undefined if the route is not ROOT_TAB_NAVIGATOR or has no state.
 */
function getRootTabState(route: {name: string; state?: NavigationState | {routes: Array<{name: string; key?: string}>; index?: number}} | undefined): RootTabState | undefined {
    if (route?.name === NAVIGATORS.ROOT_TAB_NAVIGATOR && route.state) {
        return route.state as RootTabState;
    }
    return undefined;
}

/**
 * Extracts the inner screen name from a ROOT_TAB_NAVIGATOR route's params.
 * Returns undefined if the route is not ROOT_TAB_NAVIGATOR or has no screen param.
 */
function getRootTabScreenParam(route: NavigationPartialRoute | {name: string; params?: Record<string, unknown>} | undefined): keyof RootTabNavigatorParamList | undefined {
    if (route?.name === NAVIGATORS.ROOT_TAB_NAVIGATOR && route.params && 'screen' in route.params) {
        return route.params.screen as keyof RootTabNavigatorParamList;
    }
    return undefined;
}

export {getRootTabState, getRootTabScreenParam};
