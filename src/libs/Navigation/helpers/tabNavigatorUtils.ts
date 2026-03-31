import type {NavigationState} from '@react-navigation/native';
import type {NavigationPartialRoute, TabNavigatorParamList} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

type RootTabState = {
    routes: Array<{name: string; key?: string; state?: NavigationState}>;
    index?: number;
};

/**
 * Extracts the tab navigator state from a TAB_NAVIGATOR route.
 * Returns undefined if the route is not TAB_NAVIGATOR or has no state.
 */
function getTabState(route: {name: string; state?: NavigationState | {routes: Array<{name: string; key?: string}>; index?: number}} | undefined): RootTabState | undefined {
    if (route?.name === NAVIGATORS.TAB_NAVIGATOR && route.state) {
        return route.state as RootTabState;
    }
    return undefined;
}

/**
 * Extracts the inner screen name from a TAB_NAVIGATOR route's params.
 * Returns undefined if the route is not TAB_NAVIGATOR or has no screen param.
 */
function getTabScreenParam(route: NavigationPartialRoute | {name: string; params?: Record<string, unknown>} | undefined): keyof TabNavigatorParamList | undefined {
    if (route?.name === NAVIGATORS.TAB_NAVIGATOR && route.params && 'screen' in route.params) {
        return route.params.screen as keyof TabNavigatorParamList;
    }
    return undefined;
}

export {getTabState, getTabScreenParam};
