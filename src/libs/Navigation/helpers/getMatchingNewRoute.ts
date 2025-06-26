import oldRoutes from '@navigation/linkingConfig/OldRoutes';

/**
 * Maps an old route path to its corresponding new route based on the `oldRoutes` map.
 * It finds the best matching pattern (with wildcard `*` support) and replaces the matched
 * part of the path with the new route value.
 *
 * @param path - The input URL path to match and transform.
 * @returns The new route path if a match is found, otherwise `undefined`.
 *
 * Related issue: https://github.com/Expensify/App/issues/64968
 */
function getMatchingNewRoute(path: string) {
    let bestMatch;
    let maxLength = -1;

    for (const pattern of Object.keys(oldRoutes)) {
        const regexStr = `^${pattern.replace('*', '.*')}`;
        const regex = new RegExp(regexStr);

        if (regex.test(path) && pattern.length > maxLength) {
            bestMatch = pattern;
            maxLength = pattern.length;
        }
    }
    if (!bestMatch) {
        return bestMatch;
    }

    const finalRegexp = bestMatch?.replace('*', '') ?? '';
    return path.replace(finalRegexp, oldRoutes[bestMatch]);
}
export default getMatchingNewRoute;
