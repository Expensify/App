import Log from '@libs/Log';

/** Returns the origin of the document that linked here. Web-only, and an opaque referrer isn't a valid URL. */
function getReferrerOrigin(): string | undefined {
    if (typeof document === 'undefined' || !document.referrer) {
        return undefined;
    }
    try {
        return new URL(document.referrer).origin;
    } catch {
        return undefined;
    }
}

/**
 * Collapses runs of two or more slashes into one. Pass the path only: a query param can legitimately carry '//'.
 * Three or more slashes resolve the same way as two, which is why this matches `{2,}` and not an exact pair.
 */
function collapseRepeatedSlashes(path: string): string {
    return path.replaceAll(/\/{2,}/g, '/');
}

/**
 * Adds the leading '/' Expensify paths use but react-navigation doesn't, and collapses repeated slashes.
 * A '//' path is protocol-relative to the browser - the first segment becomes the host - so `pushState`
 * rejects it (#97470). React navigation keeps the raw input on `route.path` and pushes it verbatim later.
 */
function normalizePath(path: string) {
    const queryIndex = path.indexOf('?');
    const pathOnly = queryIndex === -1 ? path : path.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : path.slice(queryIndex);

    if (pathOnly.includes('//')) {
        // The query is omitted - it can carry data we shouldn't ship. The referrer origin is the one
        // field that can name whoever built the malformed link.
        Log.alert('[Navigation] normalizePath received a malformed path', {path: pathOnly, referrerOrigin: getReferrerOrigin()});
    }

    const collapsedPath = collapseRepeatedSlashes(pathOnly);

    return `${collapsedPath.startsWith('/') ? collapsedPath : `/${collapsedPath}`}${query}`;
}

export default normalizePath;
export {collapseRepeatedSlashes};
