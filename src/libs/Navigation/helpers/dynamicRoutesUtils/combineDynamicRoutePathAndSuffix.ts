import Log from '@libs/Log';
import type {Route} from '@src/ROUTES';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Merges two query strings into one. If both contain the same key, an error is thrown.
 */
const mergeQueryStrings = (baseQuery = '', suffixQuery = ''): string => {
    if (!baseQuery && !suffixQuery) {
        return '';
    }
    const params = new URLSearchParams(baseQuery);
    const suffixParams = new URLSearchParams(suffixQuery);
    for (const [key, value] of suffixParams.entries()) {
        if (params.has(key)) {
            throw new Error(`[createDynamicRoute] Query param "${key}" exists in both base path and dynamic suffix. This is not allowed.`);
        }
        params.set(key, value);
    }
    const result = params.toString();
    return result ? `?${result}` : '';
};

/**
 * Combines a base path with a dynamic route suffix, merging query parameters.
 * If the base path has no path segment, logs and returns the suffix only (active-route case).
 */
export default function combineDynamicRoutePathAndSuffix(basePath: string, suffixWithQuery: string): Route {
    const [normalizedBasePath, baseQuery] = splitPathAndQuery(basePath);
    const [suffixPath, suffixQuery] = splitPathAndQuery(suffixWithQuery);

    if (!normalizedBasePath) {
        Log.warn('[createDynamicRoute.ts] Path is undefined or empty, returning suffix only', {basePath, suffixWithQuery});
        return suffixWithQuery as Route;
    }

    const combinedPath = normalizedBasePath === '/' ? `/${suffixPath}` : `${normalizedBasePath}/${suffixPath}`;
    const mergedQuery = mergeQueryStrings(baseQuery, suffixQuery);

    return `${combinedPath}${mergedQuery}` as Route;
}
