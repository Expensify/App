import type {Route} from '@src/ROUTES';

import findAllMatchingDynamicSuffixes from './findAllMatchingDynamicSuffixes';
import getDynamicRouteQueryParams from './getDynamicRouteQueryParams';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Returns the path without a dynamic route suffix, stripping suffix-specific query parameters
 * (derived from the matching DYNAMIC_ROUTES.getRoute output) and preserving any remaining ones.
 *
 * @param fullPath - The full URL path possibly containing query params (e.g., '/settings/profile/address/country?country=US')
 * @param dynamicSuffix - The actual dynamic suffix to strip (e.g., 'country' or 'flag/123/abc')
 * @param patternSuffix - Optional registered pattern suffix for parametric routes (e.g. 'flag/:reportID/:reportActionID').
 *                         Used for looking up queryParams config. Falls back to dynamicSuffix if not provided.
 * @returns The path without the suffix and with only base-path query params preserved
 */
function getPathWithoutDynamicSuffix(fullPath: string, dynamicSuffix: string, patternSuffix?: string): Route {
    const [pathWithoutQuery, query] = splitPathAndQuery(fullPath);
    const pathWithoutDynamicSuffix = pathWithoutQuery?.slice(0, -(dynamicSuffix.length + 1)) ?? '';

    if (!pathWithoutDynamicSuffix || pathWithoutDynamicSuffix === '/') {
        return '';
    }

    // Use the pattern suffix (if provided) to look up query params to strip,
    // since the actual suffix contains concrete values, not the config key.
    const paramsToStrip = getDynamicRouteQueryParams(patternSuffix ?? dynamicSuffix);
    let filteredQuery = query;
    if (paramsToStrip?.length && query) {
        // The base path can itself end with a dynamic suffix, and sibling suffixes share param names, so stripping
        // wholesale would leave that base suffix without the params it needs. We can't tell which of the matching
        // candidates is the real one without the navigation state, so keep any param one of them could own -
        // over-keeping is harmless, dropping one breaks the base route.
        const paramsOwnedByBase = new Set(findAllMatchingDynamicSuffixes(pathWithoutDynamicSuffix).flatMap((match) => getDynamicRouteQueryParams(match.pattern) ?? []));
        const params = new URLSearchParams(query);
        for (const key of paramsToStrip) {
            if (paramsOwnedByBase.has(key)) {
                continue;
            }
            params.delete(key);
        }
        const result = params.toString();
        filteredQuery = result || undefined;
    }

    return `${pathWithoutDynamicSuffix}${filteredQuery ? `?${filteredQuery}` : ''}` as Route;
}

export default getPathWithoutDynamicSuffix;
