import {findFocusedRoute, getPathFromState as RNGetPathFromState} from '@react-navigation/native';
import type {NavigationState, PartialState} from '@react-navigation/routers';
import {linkingConfig} from '@libs/Navigation/linkingConfig';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

type State = NavigationState | Omit<PartialState<NavigationState>, 'stale'>;

type RemoveDynamicRouteResult = {
    cleanedState: State;
    dynamicRouteScreen: Screen;
};

type StackItem = {
    parent: State;
    routeIndex: number;
};

/**
 * Checks if a screen name is a dynamic route screen
 */
function isDynamicRouteScreen(screenName: Screen): boolean {
    for (const {path} of Object.values(DYNAMIC_ROUTES)) {
        if (!normalizedConfigs[screenName]?.path) {
            continue;
        }
        if (path === normalizedConfigs[screenName].path) {
            return true;
        }
    }
    return false;
}

/**
 * Removes only one dynamic route from navigation state and identifies it.
 * This function traverses the navigation state tree, finds dynamic route,
 * removes it from the state structure, and returns both the cleaned state and
 * removed dynamic screen name.
 */
function removeDynamicRouteFromState(state: State): RemoveDynamicRouteResult {
    const stack: StackItem[] = [];

    let current: State = state;

    // Traverse down to the deepest focused route in the navigation tree
    while (true) {
        const routeIndex = current.index ?? 0;
        const route = current.routes[routeIndex];

        // If route has no nested state, we've reached the bottom
        if (!route?.state) {
            break;
        }
        // Save current level info for later reconstruction
        stack.push({parent: current, routeIndex});

        // Move to the next level down
        current = route.state;
    }

    // Get the focused route at the deepest level
    const focusedRouteIndex = current.index ?? 0;
    const focusedRoute = current.routes[focusedRouteIndex];

    // Save the dynamic route screen name
    const dynamicRouteScreen = focusedRoute.name as Screen;

    // Remove the focused route from current level and update indices
    let cleanedState = {
        ...current,
        routes: current.routes.filter((_, i) => i !== focusedRouteIndex) as typeof current.routes,
        index: Math.max(0, focusedRouteIndex - 1),
    } as State;

    // Reconstruct the navigation state from bottom to top
    for (let i = stack.length - 1; i >= 0; i--) {
        const stackItem = stack.at(i);
        if (!stackItem) {
            continue;
        }
        const {parent, routeIndex} = stackItem;
        const parentRoutes = parent.routes;

        // Create updated child route with the cleaned state
        const updatedChild = {...parentRoutes[routeIndex], state: cleanedState};

        // If cleaned state has no routes left, remove the entire branch
        if (cleanedState.routes.length === 0) {
            cleanedState = {
                ...parent,
                routes: parentRoutes.filter((r, j) => j !== routeIndex) as typeof parent.routes,
                index: Math.max(0, routeIndex - 1),
            } as State;
            continue;
        }

        // Update parent with the modified child
        cleanedState = {
            ...parent,
            routes: parentRoutes.map((r, j) => (j === routeIndex ? updatedChild : r)) as typeof parent.routes,
        } as State;
    }

    return {cleanedState, dynamicRouteScreen};
}

/**
 * Appends dynamic route suffixes to a path
 */
function appendDynamicRouteToPath(basePath: string, dynamicRouteScreen: Screen): string {
    if (!dynamicRouteScreen) {
        return basePath;
    }

    const dynamicSuffix: DynamicRouteSuffix = normalizedConfigs[dynamicRouteScreen]?.path;
    if (!dynamicSuffix) {
        throw new Error(`Linking config path not found for dynamic route screen: ${dynamicRouteScreen}`);
    }

    // Split path and query parameters
    const [pathPart, queryPart] = basePath.split('?');
    const separator = pathPart.endsWith('/') ? '' : '/';

    // Construct final path with dynamic suffix and query parameters
    const pathWithSuffix = `${pathPart}${separator}${dynamicSuffix}`;

    return queryPart ? `${pathWithSuffix}?${queryPart}` : pathWithSuffix;
}

const getPathFromState = (state: State): string => {
    const focusedRoute = findFocusedRoute(state);
    const screenName = focusedRoute?.name ?? '';

    // Handle dynamic route screens that need special path processing
    if (isDynamicRouteScreen(screenName as Screen)) {
        // Use direct path if already available on the route
        if (focusedRoute?.path) {
            return focusedRoute.path;
        }

        // Remove dynamic route from state and collect it
        const {cleanedState, dynamicRouteScreen} = removeDynamicRouteFromState(state);

        // Get path from cleaned state using original function
        const path = RNGetPathFromState(cleanedState, linkingConfig.config);

        // Append dynamic route to the path
        const finalPath = appendDynamicRouteToPath(path ?? '', dynamicRouteScreen);
        return finalPath;
    }

    // For regular routes, use React Navigation's default path generation
    const path = RNGetPathFromState(state, linkingConfig.config);

    return path;
};

export default getPathFromState;
