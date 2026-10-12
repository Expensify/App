/**
 * Joins a dynamic-route base path with its suffix, special-casing a root base (`/`) so the two
 * aren't concatenated into a `//`-prefixed (protocol-relative) path.
 * @param basePath - The base path (e.g., '/' or '/settings/wallet')
 * @param suffix - The dynamic route suffix to append (without leading slash)
 * @returns The joined path, e.g. '/suffix' or '/settings/wallet/suffix'
 */
function joinPathSegments(basePath: string, suffix: string): string {
    return basePath === '/' ? `/${suffix}` : `${basePath}/${suffix}`;
}

export default joinPathSegments;
