import type {Route} from '@src/ROUTES';
import getDynamicRouteQueryParams from './getDynamicRouteQueryParams';
import splitPathAndQuery from './splitPathAndQuery';

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

    if (!pathWithoutDynamicSuffix || pathWithoutDynamicSuffix === '/') {
        return '';
    }

    const paramsToStrip = getDynamicRouteQueryParams(dynamicSuffix);
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
