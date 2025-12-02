import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {SHARED_ROUTE_PARAMS} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';

function getParamsFromRoute(screenName: string, includeSharedParams?: boolean): string[] {
    const routeConfig = normalizedConfigs[screenName as Screen];

    if (!routeConfig?.pattern) {
        return [];
    }

    const route = routeConfig.pattern;
    const pathParams = route.match(/(?<=[:?&])(\w+)(?=[/=?&]|$)/g) ?? [];

    if (!includeSharedParams) {
        return pathParams;
    }

    // Get shared parameters from the configuration
    const sharedParams = SHARED_ROUTE_PARAMS[screenName as Screen] ?? [];

    // Combine both path parameters and shared parameters, removing duplicates
    return [...new Set([...pathParams, ...sharedParams])];
}

export default getParamsFromRoute;
