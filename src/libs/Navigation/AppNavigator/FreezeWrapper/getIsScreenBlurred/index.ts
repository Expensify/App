import type {NavigationState} from '@react-navigation/native';
import {isFullScreenName} from '@libs/NavigationUtils';

function getIsScreenBlurred(state: NavigationState, currentRouteKey: string) {
    const lastFullScreenRoute = state.routes.findLast((route) => isFullScreenName(route.name));
    return lastFullScreenRoute?.key !== currentRouteKey;
}

export default getIsScreenBlurred;
