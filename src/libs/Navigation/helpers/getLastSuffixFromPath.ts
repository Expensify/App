import Log from '@libs/Log';

/**
 * Extracts the last segment from a URL path, removing query parameters and trailing slashes.
 *
 * @param path - The URL path to extract the suffix from (can be undefined)
 * @returns The last segment of the path as a string
 */
function getLastSuffixFromPath(path: string | undefined): string {
    const pathWithoutParams = path?.split('?').at(0);

    if (!pathWithoutParams) {
        Log.warn('[getLastSuffixFromPath.ts] Failed to parse the path, path is empty');
        return '';
    }

    const pathWithoutTrailingSlash = pathWithoutParams.endsWith('/') ? pathWithoutParams.slice(0, -1) : pathWithoutParams;

    const lastSuffix = pathWithoutTrailingSlash.split('/').pop() ?? '';

    return lastSuffix;
}

export default getLastSuffixFromPath;
