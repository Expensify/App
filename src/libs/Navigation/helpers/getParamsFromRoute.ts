import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';

import {SHARED_ROUTE_PARAMS} from '@src/ROUTES';

function getParamsFromRoute(screenName: string, includeSharedParams?: boolean): string[] {
    const routeConfig = Object.entries(normalizedConfigs).find(([name]) => name === screenName)?.[1];

    if (!routeConfig?.pattern) {
        return [];
    }

    const route = routeConfig.pattern;
    const pathParams = route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g) ?? [];

    if (!includeSharedParams) {
        return pathParams;
    }

    // Get shared parameters from the configuration
    const sharedParams = Object.entries(SHARED_ROUTE_PARAMS).find(([name]) => name === screenName)?.[1] ?? [];

    // Combine both path parameters and shared parameters, removing duplicates
    return [...new Set([...pathParams, ...sharedParams])];
}

export default getParamsFromRoute;
