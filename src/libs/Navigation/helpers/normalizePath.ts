import Log from '@libs/Log';

/**
 * Returns the origin of the document that linked here, or undefined when there is none.
 * Web-only: on native there is no referrer, and an opaque referrer is not a valid URL.
 */
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
 * Normalizes a path for react-navigation: Expensify paths carry a leading '/' but react-navigation
 * doesn't, and repeated slashes have to be collapsed.
 *
 * A '//'-prefixed path is read by the browser as protocol-relative - the first segment becomes the
 * host - so `history.pushState` rejects it with a SecurityError (issue #97470). Collapsing here, at
 * the parse boundary, keeps the malformed path out of the navigation state in the first place: react
 * navigation stores the raw input on `route.path` and `useLinking` prefers it over `getPathFromState`,
 * so anything we let through here is pushed verbatim later on.
 *
 * Only the path is collapsed - a query param can legitimately carry '//' (an encoded URL, for example).
 */
function normalizePath(path: string) {
    const queryIndex = path.indexOf('?');
    const pathOnly = queryIndex === -1 ? path : path.slice(0, queryIndex);
    const query = queryIndex === -1 ? '' : path.slice(queryIndex);

    if (pathOnly.includes('//')) {
        // The query is omitted on purpose - it can carry data that shouldn't be shared. The referrer
        // origin is the one field that can name whoever built the malformed link.
        Log.alert('[Navigation] normalizePath received a malformed path', {path: pathOnly, referrerOrigin: getReferrerOrigin()});
    }

    const collapsedPath = pathOnly.replaceAll(/\/{2,}/g, '/');

    return `${collapsedPath.startsWith('/') ? collapsedPath : `/${collapsedPath}`}${query}`;
}

export default normalizePath;
