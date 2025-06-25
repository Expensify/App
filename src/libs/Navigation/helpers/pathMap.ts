const pathMap: Record<string, string> = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    '/settings/workspaces/*': '/workspaces/',
};

function getBestMatchingPath(path: string) {
    let bestMatch;
    let maxLength = -1;

    for (const pattern of Object.keys(pathMap)) {
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
    return path.replace(finalRegexp, pathMap[bestMatch]);
}
export default getBestMatchingPath;
