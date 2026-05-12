import type {NavigationRoute, NavigationState, ParamListBase, StackNavigationState} from '@react-navigation/native';
import {getPreservedNavigatorState, setPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import NAVIGATORS from '@src/NAVIGATORS';

type Route = NavigationRoute<ParamListBase, string>;
type TabRouteEntry = {key: string; state?: StackNavigationState<ParamListBase>};

/**
 * Reattaches preserved TAB_NAVIGATOR state to any tab route that lost it during slicing,
 * and re-seeds preservedNavigatorStates for every nested tab route so SplitRouter.getInitialState()
 * can restore non-focused split navigators when the user later visits those tabs.
 *
 * Note: this has a side effect on preservedNavigatorStates in addition to returning new routes.
 */
export default function restoreTabNavigatorRoutes(routes: Route[]): Route[] {
    return routes.map((route) => {
        if (route.name !== NAVIGATORS.TAB_NAVIGATOR || route.state !== undefined) {
            return route;
        }
        const preservedState = getPreservedNavigatorState<NavigationState>(route.key);
        if (!preservedState) {
            return route;
        }
        for (const tabRoute of preservedState.routes as TabRouteEntry[]) {
            if (!tabRoute.state) {
                continue;
            }
            setPreservedNavigatorState(tabRoute.key, tabRoute.state);
        }
        return {...route, state: preservedState};
    });
}
