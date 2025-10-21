import {findFocusedRoute} from '@react-navigation/native';
import type {DynamicRouteSuffix, Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import getLastSuffixFromPath from './getLastSuffixFromPath';
import getStateFromPath from './getStateFromPath';

function getForwardToFromPath(path: string): Route {
    const pathWithoutParams = path.split('?').at(0);

    if (!pathWithoutParams) {
        throw new Error('Failed to parse the path, path is empty');
    }

    const lastSuffix = getLastSuffixFromPath(path);
    const dynamicRouteKey = Object.keys(DYNAMIC_ROUTES).find((key) => DYNAMIC_ROUTES[key as keyof typeof DYNAMIC_ROUTES] === lastSuffix) as DynamicRouteSuffix | undefined;

    if (!dynamicRouteKey) {
        throw new Error("Provided path doesn't contain dynamic route");
    }

    const pathWithoutDynamicRoute = pathWithoutParams.replace(`/${lastSuffix}`, '');

    const screenName = findFocusedRoute(getStateFromPath(pathWithoutDynamicRoute as Route) ?? {});

    if (!screenName?.name) {
        throw new Error('Failed to parse the path, screen name is missing');
    }

    return pathWithoutDynamicRoute as Route;
}

export default getForwardToFromPath;
