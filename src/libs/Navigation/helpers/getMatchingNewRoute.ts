import StringUtils from '@libs/StringUtils';

import oldRoutes from '@navigation/linkingConfig/OldRoutes';

/**
 * Converts an OldRoutes pattern string into a RegExp.
 *
 * A trailing `*` (last in the pattern) matches any remaining characters (multi-segment).
 * A non-trailing `*` matches exactly one path segment.
 *
 * Captured groups can be referenced in the replacement via `$1`, `$2`, etc.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function patternToRegex(pattern: string): RegExp {
    const parts = pattern.split('*');
    let regexStr = '^';

    for (let i = 0; i < parts.length; i++) {
        regexStr += StringUtils.escapeRegExp(parts.at(i) ?? '');
        if (i < parts.length - 1) {
            const isTrailing = i === parts.length - 2 && pattern.endsWith('*');
            regexStr += isTrailing ? '(.*)' : '([^/]+)';
        }
    }

    regexStr += '(?=[?#]|$)';

    return new RegExp(regexStr);
}

/**
 * Maps an old route path to its corresponding new route based on the `oldRoutes` map.
 * It finds the best matching pattern (with wildcard `*` support) and replaces the matched
 * part of the path with the new route value.
 *
 * Wildcards:
 * - Trailing `*` matches any remaining path (including `/`).
 * - Non-trailing `*` matches exactly one path segment.
 * - Use `$1`, `$2`, … in the replacement string to reference captured wildcards.
 *
 * @param path - The input URL path to match and transform.
 * @returns The new route path if a match is found, otherwise `undefined`.
 *
 * Related issue: https://github.com/Expensify/App/issues/64968
 */
function getMatchingNewRoute(path: string) {
    // The trailing wildcard (`(.*)`) must not swallow the query string, otherwise a legacy
    // URL carrying `?backTo=…` (or any query) gets mangled — the reportID capture absorbs
    // the query and the redirect's own params land inside it. Match on the path only and
    // re-append the original query, merging it with any query the redirect template adds.
    const [pathOnly, query] = path.split('?');
    let bestMatch: string | undefined;
    let bestRegex: RegExp | undefined;
    let maxLength = -1;

    for (const pattern of Object.keys(oldRoutes)) {
        const regex = patternToRegex(pattern);

        if (regex.test(pathOnly) && pattern.length > maxLength) {
            bestMatch = pattern;
            bestRegex = regex;
            maxLength = pattern.length;
        }
    }

    if (!bestMatch || !bestRegex) {
        return undefined;
    }

    const replaced = pathOnly.replace(bestRegex, oldRoutes[bestMatch]);
    if (!query) {
        return replaced;
    }
    return replaced.includes('?') ? `${replaced}&${query}` : `${replaced}?${query}`;
}

export default getMatchingNewRoute;
