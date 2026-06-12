import type {NavigationRoute} from '@libs/Navigation/types';
import NAVIGATORS from '@src/NAVIGATORS';

/**
 * Returns the active tab name for a given route.
 * If the route is TAB_NAVIGATOR, it returns the name of the focused tab inside it.
 * Otherwise, it returns the route name itself.
 */
function getActiveTabName(route: NavigationRoute | undefined): string | undefined {
    if (!route) {
        return undefined;
    }

    if (route.name === NAVIGATORS.TAB_NAVIGATOR && route.state) {
        const index = route.state.index ?? 0;
        return route.state.routes?.at(index)?.name;
    }

    return route.name;
}

export default getActiveTabName;
