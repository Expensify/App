import type {NavigationState} from '@react-navigation/native';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';

type Options = {
    /** When true, treat state as tab navigator: focused route is at index. Use for screens inside Tab.Navigator. */
    freezeWhenInTabBackground?: boolean;
};

function getIsScreenBlurred(state: NavigationState, currentRouteKey: string, options?: Options) {
    if (options?.freezeWhenInTabBackground && typeof state.index === 'number' && state.index >= 0 && state.index < state.routes.length) {
        const focusedRoute = state.routes[state.index];
        return focusedRoute?.key !== currentRouteKey;
    }
    // If the screen is one of the last two fullscreen routes in the stack, it is not freezed on native platforms.
    // One screen below the focused one should not be freezed to allow users to return by swiping left.
    const lastTwoFullScreenRoutes = state.routes.filter((route) => isFullScreenName(route.name)).slice(-2);
    return !lastTwoFullScreenRoutes.some((route) => route.key === currentRouteKey);
}

export default getIsScreenBlurred;
