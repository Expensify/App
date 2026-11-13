import type {NavigationState} from '@react-navigation/native';

/**
 * The Tab.Navigator's own state, read from the state of the navigator around it. The tab navigator's body runs before
 * <Tab.Navigator> mounts, so the nearest navigation state there is still the parent stack's.
 */
function getTabNavigatorState(parentState: NavigationState, tabNavigatorRouteKey: string) {
    return parentState.routes.find((parentRoute) => parentRoute.key === tabNavigatorRouteKey)?.state;
}

export default getTabNavigatorState;
