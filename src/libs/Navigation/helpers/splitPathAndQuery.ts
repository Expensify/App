/**
 * Splits a full path into its path and query components.
 * @param fullPath - The full URL path (e.g., '/settings/wallet?param=value')
 * @returns A tuple where the first element is the path without trailing slash
 *          and the second element is the query string (if any).
 */
function splitPathAndQuery(fullPath: string | undefined): [string | undefined, string | undefined] {
    const [path, query] = fullPath?.split('?', 2) ?? [undefined, undefined];
    const normalizedPath = path?.endsWith('/') && path.length > 1 ? path.slice(0, -1) : path;
    return [normalizedPath, query];
}

export default splitPathAndQuery;
