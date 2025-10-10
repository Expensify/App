/* eslint-disable @typescript-eslint/no-unused-vars */
import {findFocusedRoute} from '@react-navigation/native';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Screen} from '@src/SCREENS';
import getStateFromPath from './getStateFromPath';

const FORWARD_TO_DYNAMIC_ROUTE_MAPPINGS = {
    VERIFY_ACCOUNT: {},
} as const;

type DynamicRouteMappingKey = keyof typeof FORWARD_TO_DYNAMIC_ROUTE_MAPPINGS;

function getForwardToFromPath(path: string): Route {
    const pathWithoutParams = path.split('?').at(0);

    if (!pathWithoutParams) {
        throw new Error('Failed to parse the path, path is empty');
    }

    const lastSuffix = path.split('?').at(0)?.split('/').pop() ?? '';

    const pathWithoutDynamicRoute = pathWithoutParams.replace(`/${lastSuffix}`, '');

    const dynamicRouteKey = Object.keys(DYNAMIC_ROUTES).find((key) => DYNAMIC_ROUTES[key as keyof typeof DYNAMIC_ROUTES] === lastSuffix) as DynamicRouteMappingKey | undefined;

    const screenName = findFocusedRoute(getStateFromPath(pathWithoutDynamicRoute as Route) ?? {});

    if (!screenName?.name) {
        throw new Error('Failed to parse the path, screen name is missing');
    }

    const routeConfig = normalizedConfigs[screenName.name as Screen];

    if (dynamicRouteKey && routeConfig?.pattern && !FORWARD_TO_DYNAMIC_ROUTE_MAPPINGS[dynamicRouteKey]?.[routeConfig.pattern]) {
        return pathWithoutDynamicRoute as Route;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return FORWARD_TO_DYNAMIC_ROUTE_MAPPINGS[dynamicRouteKey]?.[routeConfig.pattern];
}

export default getForwardToFromPath;
