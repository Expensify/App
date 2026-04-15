import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';
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

/** Adds dynamic route name (with optional query params) to the current URL and returns it */
const createDynamicRoute = (dynamicRouteSuffixWithParams: string, basePath?: string): Route => {
    const [suffixPath] = splitPathAndQuery(dynamicRouteSuffixWithParams);

    if (!suffixPath || !isDynamicRouteSuffix(suffixPath)) {
        throw new Error(`The route name ${suffixPath} is not supported in createDynamicRoute`);
    }

    const routePath = basePath ?? Navigation.getActiveRoute();
    const [normalizedBasePath, baseQuery] = splitPathAndQuery(routePath);
    const [normalizedSuffixPath, suffixQuery] = splitPathAndQuery(dynamicRouteSuffixWithParams);

    if (!normalizedBasePath) {
        Log.warn('[createDynamicRoute.ts] Path is undefined or empty, returning suffix only', {basePath: routePath, suffixWithQuery: dynamicRouteSuffixWithParams});
        return dynamicRouteSuffixWithParams as Route;
    }

    const combinedPath = normalizedBasePath === '/' ? `/${normalizedSuffixPath}` : `${normalizedBasePath}/${normalizedSuffixPath}`;
    const mergedQuery = mergeQueryStrings(baseQuery, suffixQuery);

    return `${combinedPath}${mergedQuery}` as Route;
};
export default createDynamicRoute;
