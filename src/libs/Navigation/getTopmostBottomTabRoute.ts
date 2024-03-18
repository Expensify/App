import type {BottomTabName, NavigationPartialRoute, RootStackParamList, State} from './types';

function getTopmostBottomTabRoute(state: State<RootStackParamList> | undefined): NavigationPartialRoute<BottomTabName> | undefined {
    const bottomTabNavigatorRoute = state?.routes[0];

    // The bottomTabNavigatorRoute state may be empty if we just logged in.
    if (!bottomTabNavigatorRoute || bottomTabNavigatorRoute.name !== 'BottomTabNavigator' || bottomTabNavigatorRoute.state === undefined) {
        return undefined;
    }

    const topmostBottomTabRoute = bottomTabNavigatorRoute.state.routes.at(-1);

    if (!topmostBottomTabRoute) {
        throw new Error('BottomTabNavigator route have no routes.');
    }

    return {name: topmostBottomTabRoute.name as BottomTabName, params: topmostBottomTabRoute.params};
}

export default getTopmostBottomTabRoute;
