import {dynamicRoutePaths, parametricEntriesBySegmentCount} from './isDynamicRouteSuffix';
import matchPathPattern from './matchPathPattern';
import splitPathAndQuery from './splitPathAndQuery';

type DynamicSuffixMatch = {
    /** Registered pattern, e.g. 'flag/:reportID/:reportActionID' */
    pattern: string;
    /** Actual URL values, e.g. 'flag/456/abc' */
    actualSuffix: string;
    /** Extracted path params, e.g. {reportID: '456', reportActionID: 'abc'} */
    pathParams: Record<string, string>;
};

/**
 * Finds a registered dynamic route suffix that matches the end of the given path.
 * Iterates path sub-suffixes from longest to shortest and checks each against
 * registered dynamic paths. Supports both exact static matches and parametric
 * pattern matches (e.g. 'flag/:reportID/:reportActionID').
 *
 * @param path - The path to find the matching dynamic suffix for
 * @returns The matching dynamic suffix, or undefined if no matching suffix is found
 */
function findMatchingDynamicSuffix(path = ''): DynamicSuffixMatch | undefined {
    const [normalizedPath] = splitPathAndQuery(path);
    if (!normalizedPath) {
        return undefined;
    }

    const segments = normalizedPath.split('/').filter(Boolean);

    // Iterate from the full path (longest candidate) down to single-segment suffixes.
    // This guarantees the longest matching suffix is returned first.
    for (let i = 0; i < segments.length; i++) {
        const candidate = segments.slice(i).join('/');

        // Static match (e.g. 'country', 'verify-account')
        if (dynamicRoutePaths.has(candidate)) {
            return {pattern: candidate, actualSuffix: candidate, pathParams: {}};
        }

        // Parametric pattern match - only check patterns with the same segment count.
        const candidateSegmentCount = segments.length - i;
        const matchingEntries = parametricEntriesBySegmentCount.get(candidateSegmentCount);
        if (matchingEntries) {
            for (const entry of matchingEntries) {
                const match = matchPathPattern(candidate, entry.path);
                if (match) {
                    return {pattern: entry.path, actualSuffix: candidate, pathParams: match.params};
                }
            }
        }
    }

    return undefined;
}

export default findMatchingDynamicSuffix;
export type {DynamicSuffixMatch};
