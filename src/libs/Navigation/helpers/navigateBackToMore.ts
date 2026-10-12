import {clearLastVisitedMoreDestination} from '@libs/MoreDestinationHistory';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {getTabNavigatorState} from './tabNavigatorUtils';

function isRouteHistoryEntry(entry: unknown): entry is {type: 'route'; key: string} {
    return typeof entry === 'object' && entry !== null && 'type' in entry && entry.type === 'route' && 'key' in entry && typeof entry.key === 'string';
}

/**
 * Whether going back would land on the More page. The tab navigator keeps its full history, so pushing More again
 * from a page the user reached through it would leave that page one Back press away, and Back would loop.
 */
function isMoreThePreviousTab(): boolean {
    const tabState = getTabNavigatorState(navigationRef.getRootState());
    if (!tabState) {
        return false;
    }
    // A deeper screen inside the focused tab would take the Back first, so only a tab at its root can pop to More.
    const focusedRoute = tabState.routes.at(tabState.index ?? 0);
    if ((focusedRoute?.state?.routes.length ?? 1) > 1) {
        return false;
    }
    const history: unknown = 'history' in tabState ? tabState.history : undefined;
    if (!Array.isArray(history)) {
        return false;
    }
    const routeKeys = history.filter(isRouteHistoryEntry).map((entry) => entry.key);
    const previousKey = routeKeys.at(-2);
    return !!previousKey && tabState.routes.find((route) => route.key === previousKey)?.name === SCREENS.MORE;
}

/** Up-navigation from a page reached through More: pops back to it when it is right behind, otherwise opens it. */
function navigateBackToMore() {
    clearLastVisitedMoreDestination();
    if (isMoreThePreviousTab()) {
        Navigation.goBack();
        return;
    }
    Navigation.navigate(ROUTES.MORE);
}

export default navigateBackToMore;
