import navigationRef from '@libs/Navigation/navigationRef';

import getPathFromState from './getPathFromState';

/**
 * Returns the current active route.
 *
 * Lives in its own module rather than in `Navigation.ts` so that callers needing only the active path do not
 * have to import the whole navigation barrel, which pulls in the action layer and closes import cycles.
 */
function getActiveRoute(): string {
    if (!navigationRef.isReady()) {
        return '';
    }

    const currentRoute = navigationRef.current?.getCurrentRoute();
    if (!currentRoute?.name) {
        return '';
    }

    const routeFromState = getPathFromState(navigationRef.getRootState());

    if (routeFromState) {
        return routeFromState;
    }

    return '';
}

export default getActiveRoute;
