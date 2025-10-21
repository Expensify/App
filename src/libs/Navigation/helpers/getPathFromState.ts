import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {DynamicRoute} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

type RemoveDynamicRoutesResult = {
    cleanedState: State;
    dynamicRouteScreens: Screen[];
};

type StackItem = {
    parent: State;
    routeIndex: number;
};

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

function removeDynamicRoutesFromState(state: State): RemoveDynamicRoutesResult {
    let currentState: State = state;
    const dynamicRouteScreens: Screen[] = [];

    while (currentState.routes.length > 0) {
        const stack: StackItem[] = [];

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
        dynamicRouteScreens.push(focusedRoute.name as Screen);

        let cleanedState = {
            ...current,
            routes: current.routes.filter((_, i) => i !== focusedRouteIndex) as typeof current.routes,
            index: Math.max(0, focusedRouteIndex - 1),
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
                    index: Math.max(0, routeIndex - 1),
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

    return {cleanedState: currentState, dynamicRouteScreens};
}

/**
 * Appends dynamic route suffixes to a path
 */
function appendDynamicRoutesToPath(basePath: string, dynamicRouteScreens: Screen[]): string {
    if (dynamicRouteScreens.length === 0) {
        return basePath;
    }

    const dynamicSuffixes: DynamicRoute[] = [];
    for (const screen of dynamicRouteScreens) {
        const path = normalizedConfigs[screen]?.path;
        if (path) {
            dynamicSuffixes.push(path as DynamicRoute);
        } else {
            throw new Error(`Linking config path not found for dynamic route screen: ${screen}`);
        }
    }

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
        const {cleanedState, dynamicRouteScreens} = removeDynamicRoutesFromState(state);

        // Get path from cleaned state using original function
        const path = RNGetPathFromState(cleanedState, linkingConfig.config);

        // Append dynamic routes to the path
        const finalPath = appendDynamicRoutesToPath(path ?? '', dynamicRouteScreens);
        return finalPath;
    }

    const path = RNGetPathFromState(state, linkingConfig.config);

    return path;
};

export default getPathFromState;
