import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationRoute, NavigationState, ParamListBase, PartialRoute, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

type MutableRoute = {
    key: string;
    name: string;
    params?: object;
    path?: string;
    state?: State;
};

/**
 * Checks if a screen name is a dynamic route screen
 */
function isDynamicRouteScreen(screenName: string): boolean {
    const dynamicScreens = [SCREENS.SETTINGS.VERIFY_ACCOUNT];

    return dynamicScreens.includes(screenName);
}

function removeDynamicRoutesFromState(state: State): {cleanedState: State; dynamicRoutes: string[]} {
    let currentState: State = state;
    const dynamicRoutes: string[] = [];

    while (currentState.routes.length > 0) {
        const stack = [];

        let current: State = currentState;

        while (true) {
            const routeIndex = current.index ?? 0;
            const route = current.routes[routeIndex];
            if (!route?.state) {
                break;
            }
            stack.push({parent: current, routeIndex});
            current = route.state;
        }

        const focusedRouteIndex = current.index ?? 0;
        const focusedRoute = current.routes[focusedRouteIndex];
        if (!focusedRoute || !isDynamicRouteScreen(focusedRoute.name)) {
            return {cleanedState: currentState, dynamicRoutes};
        }

        dynamicRoutes.push(focusedRoute.name);

        let cleanedState = {
            ...current,
            routes: current.routes.filter((_, i) => i !== focusedRouteIndex) as typeof current.routes,
            index: Math.max(0, Math.min(focusedRouteIndex, current.routes.length - 2)),
        } as State;

        for (let i = stack.length - 1; i >= 0; i--) {
            const stackItem = stack.at(i);
            if (!stackItem) {
                continue;
            }
            const {parent, routeIndex} = stackItem;
            const parentRoutes = parent.routes;
            const updatedChild = {...parentRoutes[routeIndex], state: cleanedState};
            if (cleanedState.routes.length === 0) {
                cleanedState = {
                    ...parent,
                    routes: parentRoutes.filter((r, j) => j !== routeIndex) as typeof parent.routes,
                    index: parentRoutes.length ? parentRoutes.length - 2 : 0,
                } as State;
                continue;
            }
            cleanedState = {
                ...parent,
                routes: parentRoutes.map((r, j) => (j === routeIndex ? updatedChild : r)) as typeof parent.routes,
            } as State;
        }
        currentState = cleanedState;
    }

    return {cleanedState: currentState, dynamicRoutes};
}

/**
 * Appends dynamic route suffixes to a path
 */
function appendDynamicRoutesToPath(basePath: string, dynamicRoutes: string[]): string {
    if (dynamicRoutes.length === 0) {
        return basePath;
    }

    // Get the dynamic route suffixes
    const dynamicSuffixes = dynamicRoutes
        .map(() => Object.values(DYNAMIC_ROUTES).at(0)) // For now, all dynamic routes use the same suffix
        .filter(Boolean);

    if (dynamicSuffixes.length === 0) {
        return basePath;
    }

    // Split path and query parameters
    const [pathPart, queryPart] = basePath.split('?');
    const suffix = dynamicSuffixes.join('/');
    const separator = pathPart.endsWith('/') ? '' : '/';

    // Construct final path with dynamic suffix and query parameters
    const pathWithSuffix = `${pathPart}${separator}${suffix}`;

    return queryPart ? `${pathWithSuffix}?${queryPart}` : pathWithSuffix;
}

const getPathFromState = (state: State): string => {
    // Remove dynamic routes from state and collect them
    const {cleanedState, dynamicRoutes} = removeDynamicRoutesFromState(state);
    console.log(cleanedState);

    // Get path from cleaned state using original function
    const path = RNGetPathFromState(state, linkingConfig.config);

    const basePath = RNGetPathFromState(cleanedState, linkingConfig.config);
    console.log('basePath:', basePath);

    // Append dynamic routes to the path
    const finalPath = appendDynamicRoutesToPath(basePath, dynamicRoutes);
    console.log('finalPath:', finalPath);

    return finalPath;

    // return finalPath;
};

export default getPathFromState;
