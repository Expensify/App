import type {Route} from '@src/ROUTES';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import splitPathAndQuery from './splitPathAndQuery';

function getQueryParamsToStrip(dynamicSuffix: string): string[] | undefined {
    const keys = Object.keys(DYNAMIC_ROUTES) as Array<keyof typeof DYNAMIC_ROUTES>;
    const match = keys.find((key) => DYNAMIC_ROUTES[key].path === dynamicSuffix);
    if (!match) {
        return undefined;
    }
    const config = DYNAMIC_ROUTES[match];
    if (!('getRoute' in config) || !config.getRoute) {
        return undefined;
    }
    const getRouteFn = config.getRoute as unknown as (...args: string[]) => string;
    const placeholderArgs: string[] = Array(getRouteFn.length).fill('') as string[];
    const routeOutput = getRouteFn(...placeholderArgs);
    const [, query] = splitPathAndQuery(routeOutput);
    if (!query) {
        return undefined;
    }
    return Array.from(new URLSearchParams(query).keys());
}

/**
 * Returns the path without a dynamic route suffix, stripping suffix-specific query parameters
 * (derived from the matching DYNAMIC_ROUTES.getRoute output) and preserving any remaining ones.
 *
 * @param fullPath - The full URL path possibly containing query params (e.g., '/settings/profile/address/country?country=US')
 * @param dynamicSuffix - The dynamic suffix to strip (e.g., 'country')
 * @returns The path without the suffix and with only base-path query params preserved
 */
function getPathWithoutDynamicSuffix(fullPath: string, dynamicSuffix: string): Route {
    const [pathWithoutQuery, query] = splitPathAndQuery(fullPath);
    const pathWithoutDynamicSuffix = pathWithoutQuery?.slice(0, -(dynamicSuffix.length + 1)) ?? '';

    const paramsToStrip = getQueryParamsToStrip(dynamicSuffix);
    let filteredQuery = query;
    if (paramsToStrip?.length && query) {
        const params = new URLSearchParams(query);
        for (const key of paramsToStrip) {
            params.delete(key);
        }
        const result = params.toString();
        filteredQuery = result || undefined;
    }

    return `${pathWithoutDynamicSuffix}${filteredQuery ? `?${filteredQuery}` : ''}` as Route;
}

export default getPathWithoutDynamicSuffix;
