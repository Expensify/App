import type {NavigationState} from '@react-navigation/native';
import type {ExpensifyTabNavigatorParamList, NavigationPartialRoute} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

type RootTabState = {
    routes: Array<{name: string; key?: string; state?: NavigationState}>;
    index?: number;
};

/**
 * Extracts the tab navigator state from a EXPENSIFY_TAB_NAVIGATOR route.
 * Returns undefined if the route is not EXPENSIFY_TAB_NAVIGATOR or has no state.
 */
function getExpensifyTabState(route: {name: string; state?: NavigationState | {routes: Array<{name: string; key?: string}>; index?: number}} | undefined): RootTabState | undefined {
    if (route?.name === NAVIGATORS.EXPENSIFY_TAB_NAVIGATOR && route.state) {
        return route.state as RootTabState;
    }
    return undefined;
}

/**
 * Extracts the inner screen name from a EXPENSIFY_TAB_NAVIGATOR route's params.
 * Returns undefined if the route is not EXPENSIFY_TAB_NAVIGATOR or has no screen param.
 */
function getExpensifyTabScreenParam(route: NavigationPartialRoute | {name: string; params?: Record<string, unknown>} | undefined): keyof ExpensifyTabNavigatorParamList | undefined {
    if (route?.name === NAVIGATORS.EXPENSIFY_TAB_NAVIGATOR && route.params && 'screen' in route.params) {
        return route.params.screen as keyof ExpensifyTabNavigatorParamList;
    }
    return undefined;
}

export {getExpensifyTabState, getExpensifyTabScreenParam};
