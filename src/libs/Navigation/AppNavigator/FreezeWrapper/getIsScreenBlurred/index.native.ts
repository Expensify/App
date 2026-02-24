import type {NavigationState} from '@react-navigation/native';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';

function getIsScreenBlurred(state: NavigationState, currentRouteKey: string) {
    // If the screen is one of the last two fullscreen routes in the stack, it is not freezed on native platforms.
    // One screen below the focused one should not be freezed to allow users to return by swiping left.
    const lastTwoFullScreenRoutes = state.routes.filter((route) => isFullScreenName(route.name)).slice(-2);
    return !lastTwoFullScreenRoutes.some((route) => route.key === currentRouteKey);
}

export default getIsScreenBlurred;
