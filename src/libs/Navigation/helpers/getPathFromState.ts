import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

/**
 * Checks if a screen name is a dynamic route screen
 */
function isDynamicRouteScreen(screenName: Screen): boolean {
    for (const path of Object.values(DYNAMIC_ROUTES)) {
        if (!normalizedConfigs[screenName]?.path) {
            continue;
        }
        if (path === normalizedConfigs[screenName].path) {
            return true;
        }
    }
    return false;
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
        if (!focusedRoute || !isDynamicRouteScreen(focusedRoute.name as Screen)) {
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
    const focusedRoute = findFocusedRoute(state);
    const screenName = focusedRoute?.name ?? '';

    if (isDynamicRouteScreen(screenName as Screen)) {
        if (focusedRoute?.path) {
            return focusedRoute.path;
        }

        // Remove dynamic routes from state and collect them
        const {cleanedState, dynamicRoutes} = removeDynamicRoutesFromState(state);

        // Get path from cleaned state using original function
        const path = RNGetPathFromState(cleanedState, linkingConfig.config);

        // Append dynamic routes to the path
        const finalPath = appendDynamicRoutesToPath(path ?? '', dynamicRoutes);
        return finalPath;
    }

    const path = RNGetPathFromState(state, linkingConfig.config);

    return path;
};

export default getPathFromState;
