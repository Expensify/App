import {BottomTabName, NavigationPartialRoute, RootStackParamList, State} from './types';

function getTopmostBottomTabRoute(state: State<RootStackParamList>): NavigationPartialRoute<BottomTabName> {
    const bottomTabNavigatorRoute = state.routes[0];

    if (!bottomTabNavigatorRoute || bottomTabNavigatorRoute.name !== 'BottomTabNavigator' || bottomTabNavigatorRoute.state === undefined) {
        throw new Error('There is no bottomTabNavigator route mounted as the first route in the root state.');
    }

    const topmostBottomTabRoute = bottomTabNavigatorRoute.state.routes.at(-1);

    if (!topmostBottomTabRoute) {
        throw new Error('BottomTabNavigator route have no routes.');
    }

    return {name: topmostBottomTabRoute.name as BottomTabName, params: topmostBottomTabRoute.params};
}

export default getTopmostBottomTabRoute;
