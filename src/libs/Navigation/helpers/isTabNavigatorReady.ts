import type {NavigationState, PartialState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * Checks whether TabNavigator's child router has mounted and produced a
 * non-stale nested state. Until `useNavigationBuilder` runs inside
 * TabNavigator, the route's nested state stays `stale: true` and React
 * Navigation cannot handle NAVIGATE actions targeting screens inside it.
 */
function isTabNavigatorReady(state: NavigationState | PartialState<NavigationState> | undefined): boolean {
    const tabRoute = state?.routes?.find((route) => route.name === NAVIGATORS.TAB_NAVIGATOR);
    return tabRoute?.state?.stale === false;
}

export default isTabNavigatorReady;
