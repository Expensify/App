import Log from '@libs/Log';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Extracts the last segment from a URL path, removing query parameters and trailing slashes.
 *
 * @param path - The URL path to extract the suffix from (can be undefined)
 * @returns The last segment of the path as a string
 */
function getLastSuffixFromPath(path: string | undefined): string {
    const [normalizedPath] = splitPathAndQuery(path ?? '');

    if (!normalizedPath) {
        Log.warn('[getLastSuffixFromPath.ts] Failed to parse the path, path is empty');
        return '';
    }

    const lastSuffix = normalizedPath.split('/').pop() ?? '';

    return lastSuffix;
}

export default getLastSuffixFromPath;
