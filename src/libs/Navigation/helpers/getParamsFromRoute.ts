import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';

import {SHARED_ROUTE_PARAMS} from '@src/ROUTES';

import type {RouteConfig} from './createNormalizedConfigs';

function getParamsFromRoute(screenName: string, includeSharedParams?: boolean): string[] {
    // Callers pass plain strings (e.g. split navigator options), so read the configs as a string-keyed map where the name can be missing.
    const routeConfigs: Partial<Record<string, RouteConfig>> = normalizedConfigs;
    const routeConfig = routeConfigs[screenName];

    if (!routeConfig?.pattern) {
        return [];
    }

    const route = routeConfig.pattern;
    const pathParams = route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g) ?? [];

    if (!includeSharedParams) {
        return pathParams;
    }

    // Get shared parameters from the configuration
    const sharedRouteParams: Partial<Record<string, string[]>> = SHARED_ROUTE_PARAMS;
    const sharedParams = sharedRouteParams[screenName] ?? [];

    // Combine both path parameters and shared parameters, removing duplicates
    return [...new Set([...pathParams, ...sharedParams])];
}

export default getParamsFromRoute;
