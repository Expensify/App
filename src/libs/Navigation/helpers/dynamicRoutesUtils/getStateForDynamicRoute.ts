import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import splitPathAndQuery from './splitPathAndQuery';

type ParseConfig = Record<string, (value: string) => unknown>;

type LeafRoute = {
    name: string;
    path: string;
    params?: Record<string, unknown>;
};

type NestedRoute = {
    name: string;
    state: {
        routes: [RouteNode];
        index: 0; // Always 0 since routes array contains exactly one element
    };
};

type RouteNode = LeafRoute | NestedRoute;

const configEntries = Object.entries(normalizedConfigs);

/**
 * Parses a query string into a key-value record.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function getParamsFromQuery(query: string | undefined, parseConfig?: ParseConfig): Record<string, unknown> | undefined {
    if (!query) {
        return undefined;
    }

    const entries = Array.from(new URLSearchParams(query).entries());
    if (entries.length === 0) {
        return undefined;
    }

    return Object.fromEntries(
        entries.map(([key, value]) => {
            const parser = parseConfig?.[key];

            if (!parser) {
                return [key, value];
            }

            try {
                return [key, parser(value)];
            } catch {
                return [key, value];
            }
        }),
    );
}

/**
 * Looks up the navigation screen hierarchy (routeNames) for a given dynamic route suffix.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function getRouteConfigForDynamicRoute(dynamicRouteName: DynamicRouteSuffix): {routeNames: string[]; parse?: ParseConfig} | null {
    for (const [, config] of configEntries) {
        if (config.path === dynamicRouteName) {
            return {
                routeNames: config.routeNames,
                parse: config.parse,
            };
        }
    }

    return null;
}

function getStateForDynamicRoute(path: string, dynamicRouteName: keyof typeof DYNAMIC_ROUTES, parentRouteParams?: Record<string, unknown>) {
    const routeConfig = getRouteConfigForDynamicRoute(DYNAMIC_ROUTES[dynamicRouteName].path);
    const [, query] = splitPathAndQuery(path);
    const params = getParamsFromQuery(query, routeConfig?.parse);

    if (!routeConfig) {
        throw new Error(`No route configuration found for dynamic route '${dynamicRouteName}'`);
    }

    // Build navigation state by creating nested structure
    const buildNestedState = (routes: string[], currentIndex: number): RouteNode => {
        const currentRoute = routes.at(currentIndex);

        // If this is the last route, create leaf node with path and merged params
        if (currentIndex === routes.length - 1) {
            const mergedParams = parentRouteParams || params ? {...(parentRouteParams ?? {}), ...(params ?? {})} : undefined;
            const paramsSpread = mergedParams ? {params: mergedParams} : {};
            return {
                name: currentRoute ?? '',
                path,
                ...paramsSpread,
            };
        }

        // Create intermediate node with nested state
        return {
            name: currentRoute ?? '',
            state: {
                routes: [buildNestedState(routes, currentIndex + 1)],
                index: 0,
            },
        };
    };

    // Start building from the first route
    const rootRoute = {routes: [buildNestedState(routeConfig.routeNames, 0)]};

    return rootRoute;
}

export default getStateForDynamicRoute;
