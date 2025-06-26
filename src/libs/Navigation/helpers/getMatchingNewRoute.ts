import oldRoutes from '@navigation/linkingConfig/OldRoutes';

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
