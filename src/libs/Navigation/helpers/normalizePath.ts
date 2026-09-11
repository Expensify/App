import Log from '@libs/Log';

/**
 * Collapses runs of two or more slashes into one. Pass the pathname only: a query or fragment can legitimately
 * carry '//'. Three or more slashes resolve the same way as two, which is why this matches `{2,}`.
 */
function collapseRepeatedSlashes(path: string): string {
    return path.replaceAll(/\/{2,}/g, '/');
}

/**
 * Adds the leading '/' Expensify paths use but react-navigation doesn't, and collapses repeated slashes.
 */
function normalizePath(path: string) {
    const suffixIndex = path.search(/[?#]/);
    const pathOnly = suffixIndex === -1 ? path : path.slice(0, suffixIndex);
    const suffix = suffixIndex === -1 ? '' : path.slice(suffixIndex);

    if (pathOnly.includes('//')) {
        Log.alert('[Navigation] normalizePath received a malformed path');
    }

    const collapsedPath = collapseRepeatedSlashes(pathOnly);

    return `${collapsedPath.startsWith('/') ? collapsedPath : `/${collapsedPath}`}${suffix}`;
}

export default normalizePath;
export {collapseRepeatedSlashes};
