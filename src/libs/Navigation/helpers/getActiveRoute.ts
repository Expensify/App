import navigationRef from '@libs/Navigation/navigationRef';

import getPathFromState from './getPathFromState';

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
