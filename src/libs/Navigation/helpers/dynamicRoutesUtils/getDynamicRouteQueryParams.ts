import {DYNAMIC_ROUTES} from '@src/ROUTES';

/**
 * Returns the query parameter names that belong to a dynamic route suffix and should be
 * stripped when removing that suffix from the path. Looks up the matching DYNAMIC_ROUTES
 * config and returns its `queryParams` array if defined.
 *
 * @param dynamicSuffix - The dynamic route path segment (e.g., 'country')
 * @returns The list of query param keys to strip, or undefined if no match or no queryParams config
 */
function getDynamicRouteQueryParams(dynamicSuffix: string): readonly string[] | undefined {
    const keys = Object.keys(DYNAMIC_ROUTES) as Array<keyof typeof DYNAMIC_ROUTES>;
    const match = keys.find((key) => DYNAMIC_ROUTES[key].path === dynamicSuffix);
    if (!match) {
        return undefined;
    }
    const config = DYNAMIC_ROUTES[match];
    if (!('queryParams' in config)) {
        return undefined;
    }
    return config.queryParams;
}

export default getDynamicRouteQueryParams;
