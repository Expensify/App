import type {NavigationState} from '@react-navigation/native';
import type {ValueOf} from 'type-fest';
import {getPreservedNavigatorState} from '@libs/Navigation/AppNavigator/createSplitNavigator/usePreserveNavigatorState';
import type NAVIGATORS from '@src/NAVIGATORS';
import type {Screen} from '@src/SCREENS';

function getLastRoute(rootState: NavigationState, navigator: ValueOf<typeof NAVIGATORS>, screen: Screen) {
    const lastNavigator = rootState.routes.findLast((route) => route.name === navigator);
    const lastNavigatorState = lastNavigator?.key ? getPreservedNavigatorState(lastNavigator.key) : undefined;
    const lastRoute = lastNavigatorState?.routes.findLast((route) => route.name === screen);
    return lastRoute;
}

export default getLastRoute;
