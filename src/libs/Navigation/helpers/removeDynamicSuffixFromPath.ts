import splitPathAndQuery from './splitPathAndQuery';

/**
 * Removes a dynamic route suffix from a path while preserving query parameters.
 *
 * @param fullPath - The full URL path possibly containing query params (e.g., '/settings/wallet/verify-account?param=value')
 * @param dynamicSuffix - The dynamic suffix to strip (e.g., 'verify-account')
 * @returns The path with the suffix removed and query params re-appended
 */
function removeDynamicSuffixFromPath(fullPath: string, dynamicSuffix: string): string {
    const [pathWithoutQuery, query] = splitPathAndQuery(fullPath);
    const pathWithoutDynamicSuffix = pathWithoutQuery?.slice(0, -(dynamicSuffix.length + 1)) ?? '';
    return `${pathWithoutDynamicSuffix}${query ? `?${query}` : ''}`;
}

export default removeDynamicSuffixFromPath;
