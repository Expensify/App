import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

function parseNavigationHierarchy(dynamicRouteName: Route): string[] | null {
    // Search through normalized configs to find matching path
    for (const [, config] of Object.entries(normalizedConfigs)) {
        if (config.path === dynamicRouteName) {
            return config.routeNames;
        }
    }

    return null;
}

function getStateForDynamicRoute(path: string, dynamicRouteName: string) {
    const routeConfig = parseNavigationHierarchy(DYNAMIC_ROUTES[dynamicRouteName]);

    if (!routeConfig) {
        throw new Error(`No route configuration found for dynamic route '${dynamicRouteName}'`);
    }

    // Build navigation state by creating nested structure
    const buildNestedState = (routes: string[], currentIndex: number): any => {
        const currentRoute = routes.at(currentIndex);

        // If this is the last route, create leaf node with path
        if (currentIndex === routes.length - 1) {
            return {
                name: currentRoute,
                path,
            };
        }

        // Create intermediate node with nested state
        return {
            name: currentRoute,
            state: {
                routes: [buildNestedState(routes, currentIndex + 1)],
                index: 0,
            },
        };
    };

    // Start building from the first route
    const rootRoute = {routes: [buildNestedState(routeConfig, 0)]};

    return rootRoute;
}

export default getStateForDynamicRoute;
