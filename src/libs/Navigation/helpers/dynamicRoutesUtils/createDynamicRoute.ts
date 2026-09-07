import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';

import type {Route} from '@src/ROUTES';

import isDynamicRouteSuffix from './isDynamicRouteSuffix';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Merges two query strings into one. When both contain the same key, the suffix value wins
 * (it is the intended destination of the navigation).
 *
 * Sibling dynamic suffixes deliberately share param names (every money-request step declares
 * `action`, `iouType`, `transactionID` and `reportID`), so a collision is expected and must not be
 * fatal. A collision on *differing* values is still reported via `Log.alert` (forwarded to Sentry),
 * logging only the param name because a value can carry private data.
 *
 * @param baseQuery - The query string of the base path
 * @param suffixQuery - The query string of the suffix
 * @returns The merged query string or an empty string if both are empty
 *
 * @private - Internal helper. Do not export or use outside this file.
 *
 * @example
 * mergeQueryStrings('foo=bar', 'baz=qux') => '?foo=bar&baz=qux'
 * mergeQueryStrings('action=edit', 'action=create') => '?action=create' (suffix wins, reported to Sentry)
 */
const mergeQueryStrings = (baseQuery = '', suffixQuery = ''): string => {
    if (!baseQuery && !suffixQuery) {
        return '';
    }
    const params = new URLSearchParams(baseQuery);
    const suffixParams = new URLSearchParams(suffixQuery);
    const suffixParamsEntries = suffixParams.entries();
    for (const [key, value] of suffixParamsEntries) {
        if (params.has(key) && params.get(key) !== value) {
            Log.alert('[createDynamicRoute] Query param exists in both base path and dynamic suffix with different values; suffix value takes precedence', {key});
        }
        params.set(key, value);
    }
    const result = params.toString();
    return result ? `?${result}` : '';
};

/**
 * Combines a base path with a dynamic route suffix, merging their query parameters.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
const combinePathAndSuffix = (basePath: string, suffixWithQuery: string): Route => {
    const [normalizedBasePath, baseQuery] = splitPathAndQuery(basePath);
    const [suffixPath, suffixQuery] = splitPathAndQuery(suffixWithQuery);

    if (!normalizedBasePath) {
        Log.warn('[createDynamicRoute.ts] Path is undefined or empty, returning suffix only', {basePath, suffixWithQuery});
        return suffixWithQuery as Route;
    }

    const combinedPath = normalizedBasePath === '/' ? `/${suffixPath}` : `${normalizedBasePath}/${suffixPath}`;
    const mergedQuery = mergeQueryStrings(baseQuery, suffixQuery);

    return `${combinedPath}${mergedQuery}` as Route;
};

/** Adds dynamic route name (with optional query params) to the current URL and returns it
 *
 * Without `basePath` this resolves against whatever route is active when it runs, which is only correct at
 * interaction time. For a route built during render and followed later, use `useScreenBoundDynamicRoute`.
 *
 * @param dynamicRouteSuffixWithParams - The dynamic route suffix with optional query params
 * @param basePath - The base path to use for the dynamic route
 *
 * @returns The combined dynamic route path and query string
 */
const createDynamicRoute = (dynamicRouteSuffixWithParams: string, basePath?: string): Route => {
    const [suffixPath] = splitPathAndQuery(dynamicRouteSuffixWithParams);

    if (!suffixPath || !isDynamicRouteSuffix(suffixPath)) {
        throw new Error(`The route name ${suffixPath} is not supported in createDynamicRoute`);
    }

    const routePath = basePath ?? Navigation.getActiveRoute();
    return combinePathAndSuffix(routePath, dynamicRouteSuffixWithParams);
};

export default createDynamicRoute;
