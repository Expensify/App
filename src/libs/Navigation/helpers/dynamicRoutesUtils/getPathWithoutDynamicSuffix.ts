import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';

import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {Route} from '@src/ROUTES';

import findAllMatchingDynamicSuffixes from './findAllMatchingDynamicSuffixes';
import getDynamicRouteQueryParams from './getDynamicRouteQueryParams';
import splitPathAndQuery from './splitPathAndQuery';

/** The screens registered under each dynamic route path, to tell which screen a suffix matched at the end of a path stands for. */
const screensByDynamicRoutePath = new Map<string, string[]>();
for (const {path, screen} of Object.values(normalizedConfigs)) {
    screensByDynamicRoutePath.set(path, [...(screensByDynamicRoutePath.get(path) ?? []), screen]);
}

/**
 * Returns the query param names of the dynamic routes matched at the end of `basePath` that `strippedSuffix` is
 * registered to open from. The matches are syntactic, so a user-defined segment that looks like a dynamic path
 * (e.g. a category named "downgrade") would otherwise claim params for a screen that is not there. A `'*'` entry
 * screen vouches for none of them.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function getQueryParamsOfRouteUnderneath(basePath: string, strippedSuffix: string): Set<string> {
    const entryScreens = Object.values(DYNAMIC_ROUTES).find((route) => route.path === strippedSuffix)?.entryScreens ?? [];
    const params = findAllMatchingDynamicSuffixes(basePath)
        .filter((match) => screensByDynamicRoutePath.get(match.pattern)?.some((screen) => entryScreens.some((entryScreen) => entryScreen === screen)))
        .flatMap((match) => getDynamicRouteQueryParams(match.pattern) ?? []);
    return new Set(params);
}

/**
 * Returns the path without a dynamic route suffix, stripping suffix-specific query parameters
 * (derived from the matching DYNAMIC_ROUTES.getRoute output) and preserving any remaining ones.
 * A param also declared by the dynamic route left at the end of the base path, one the stripped
 * route opens from, is kept for it (e.g. `category/add-category?transactionID=...` keeps
 * `transactionID` for `category`).
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
    const strippedSuffix = patternSuffix ?? dynamicSuffix;
    const paramsToStrip = getDynamicRouteQueryParams(strippedSuffix);
    let filteredQuery = query;
    if (paramsToStrip?.length && query) {
        const params = new URLSearchParams(query);
        if (paramsToStrip.some((key) => params.has(key))) {
            const paramsOfRouteUnderneath = getQueryParamsOfRouteUnderneath(pathWithoutDynamicSuffix, strippedSuffix);
            for (const key of paramsToStrip) {
                if (!paramsOfRouteUnderneath.has(key)) {
                    params.delete(key);
                }
            }
        }
        const result = params.toString();
        filteredQuery = result || undefined;
    }

    return `${pathWithoutDynamicSuffix}${filteredQuery ? `?${filteredQuery}` : ''}` as Route;
}

export default getPathWithoutDynamicSuffix;
