import NAVIGATORS from '@src/NAVIGATORS';
import type {Route} from '@src/ROUTES';
import getStateFromPath from './getStateFromPath';

/**
 * Check if a route will navigate to a screen in the RightModalNavigator
 */
function willRouteNavigateToRHP(route: Route): boolean {
    try {
        const state = getStateFromPath(route);
        if (!state) {
            return false;
        }

        const lastRoute = state?.routes?.at(-1);
        return lastRoute?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR;
    } catch {
        return false;
    }
}

export default willRouteNavigateToRHP;
