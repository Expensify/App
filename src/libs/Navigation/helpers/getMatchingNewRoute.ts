import oldRoutes from '@navigation/linkingConfig/OldRoutes';

const escapeRegExp = (str: string) => str.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');

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
        regexStr += escapeRegExp(parts.at(i) ?? '');
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
    let bestMatch: string | undefined;
    let bestRegex: RegExp | undefined;
    let maxLength = -1;

    for (const pattern of Object.keys(oldRoutes)) {
        const regex = patternToRegex(pattern);

        if (regex.test(path) && pattern.length > maxLength) {
            bestMatch = pattern;
            bestRegex = regex;
            maxLength = pattern.length;
        }
    }

    if (!bestMatch || !bestRegex) {
        return undefined;
    }

    return path.replace(bestRegex, oldRoutes[bestMatch]);
}

export default getMatchingNewRoute;
