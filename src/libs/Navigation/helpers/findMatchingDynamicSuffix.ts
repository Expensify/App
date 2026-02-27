import isDynamicRouteSuffix from './isDynamicRouteSuffix';
import splitPathAndQuery from './splitPathAndQuery';

/**
 * Finds a registered dynamic route suffix that matches the end of the given path.
 * Iterates path sub-suffixes from longest to shortest and checks each against a
 * pre-built Set of registered dynamic paths, ensuring the longest match wins
 * when overlapping suffixes exist (e.g. "address/country" vs "country").
 *
 * @param path - The path to find the matching dynamic suffix for
 * @returns The matching dynamic suffix, or undefined if no matching suffix is found
 */
function findMatchingDynamicSuffix(path: string | undefined): string | undefined {
    const [normalizedPath] = splitPathAndQuery(path ?? '');
    if (!normalizedPath) {
        return undefined;
    }

    const segments = normalizedPath.split('/').filter(Boolean);

    for (let i = 0; i < segments.length; i++) {
        const candidate = segments.slice(i).join('/');
        if (isDynamicRouteSuffix(candidate)) {
            return candidate;
        }
    }

    return undefined;
}

export default findMatchingDynamicSuffix;
