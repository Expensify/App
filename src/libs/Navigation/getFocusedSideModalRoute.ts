import isSideModalNavigator from './isSideModalNavigator';
import type {NavigationPartialRoute, State} from './types';

/**
 * This function will return the focused route if exists
 * It will also look for this information in the params if it's not in the state yet.
 * This may happen if we navigate twice quickly.
 * @param state - react-navigation state including root navigator
 */
const getFocusedSideModalRoute = (state: State, isFirstCall = true): NavigationPartialRoute | undefined => {
    // We need to check if there is a side modal navigator in the state.
    if (isFirstCall) {
        const topmostSidePaneRoute = isSideModalNavigator(state.routes.at(-1)?.name) ? state.routes.at(-1) : undefined;
        if (!topmostSidePaneRoute) {
            // If there is no side modal route, return undefined
            return undefined;
        }
        return getFocusedSideModalRoute(state, false);
    }

    const topmostRoute = state.routes.at(-1);

    // We know that if there is a state we want to look deeper.
    if (topmostRoute?.state) {
        return getFocusedSideModalRoute(topmostRoute.state, false);
    }

    // It's possible that the information about focused screen is in params and not in the state yet.
    // In that case we have to check params.
    if (topmostRoute?.params && 'screen' in topmostRoute.params) {
        const name = topmostRoute.params.screen as string;
        const params = 'params' in topmostRoute.params ? (topmostRoute.params.params as Record<string, unknown>) : undefined;

        // Here we are pretending that it is a regular state.
        return getFocusedSideModalRoute({routes: [{name, params}]}, false);
    }

    if (topmostRoute) {
        return {name: topmostRoute.name, params: topmostRoute.params};
    }
};

export default getFocusedSideModalRoute;
