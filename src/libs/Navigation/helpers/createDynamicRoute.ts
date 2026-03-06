import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import type {Route} from '@src/ROUTES';
import isDynamicRouteSuffix from './isDynamicRouteSuffix';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Merges two query strings into one. If both contain the same key,
 * the suffix value wins and a warning is logged.
 */
const mergeQueryStrings = (baseQuery = '', suffixQuery = ''): string => {
    if (!baseQuery && !suffixQuery) {
        return '';
    }
    const params = new URLSearchParams(baseQuery);
    const suffixParams = new URLSearchParams(suffixQuery);
    const suffixParamsEntries = suffixParams.entries();
    for (const [key, value] of suffixParamsEntries) {
        if (params.has(key)) {
            throw new Error(`[createDynamicRoute] Query param "${key}" exists in both base path and dynamic suffix. This is not allowed.`);
        }
        params.set(key, value);
    }
    const result = params.toString();
    return result ? `?${result}` : '';
};

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

/** Adds dynamic route name (with optional query params) to the current URL and returns it */
const createDynamicRoute = (dynamicRouteSuffixWithParams: string): Route => {
    const [suffixPath] = splitPathAndQuery(dynamicRouteSuffixWithParams);

    if (!suffixPath || !isDynamicRouteSuffix(suffixPath)) {
        throw new Error(`The route name ${suffixPath} is not supported in createDynamicRoute`);
    }

    const activeRoute = Navigation.getActiveRoute();
    return combinePathAndSuffix(activeRoute, dynamicRouteSuffixWithParams);
};

export default createDynamicRoute;
