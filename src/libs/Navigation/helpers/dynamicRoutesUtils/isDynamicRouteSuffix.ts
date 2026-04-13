import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import matchPathPattern from './matchPathPattern';

const dynamicRouteEntries = Object.values(DYNAMIC_ROUTES);

// A Set of all static dynamic-route paths (e.g. 'country', 'verify-account') for O(1) lookups.
const dynamicRoutePaths = new Set<string>(dynamicRouteEntries.map((r) => r.path));

type DynamicRouteEntry = (typeof DYNAMIC_ROUTES)[keyof typeof DYNAMIC_ROUTES];

// Parametric entries are dynamic routes whose path contains ':' placeholders (e.g. 'flag/:reportID/:reportActionID').
// These cannot be matched with a simple Set lookup - they require segment-by-segment pattern matching.
const parametricEntries = dynamicRouteEntries.filter((entry) => entry.path.includes(':'));

// Pre-group parametric entries by their segment count so that findMatchingDynamicSuffix only
// needs to check patterns with the same number of segments as the URL candidate being tested.
// For example, 'flag/:reportID/:reportActionID' has 3 segments, so it goes into the group keyed by 3.
const parametricEntriesBySegmentCount = new Map<number, DynamicRouteEntry[]>();
for (const entry of parametricEntries) {
    const count = entry.path.split('/').filter(Boolean).length;
    const group = parametricEntriesBySegmentCount.get(count) ?? [];
    group.push(entry);
    parametricEntriesBySegmentCount.set(count, group);
}

/**
 * Checks if a suffix matches any dynamic route path in DYNAMIC_ROUTES.
 * Supports both exact static matches and parametric pattern matches.
 *
 * @param suffix - The suffix to check
 * @returns True if the suffix matches any dynamic route path, false otherwise
 */
function isDynamicRouteSuffix(suffix: string): suffix is DynamicRouteSuffix {
    // Exact static match
    if (dynamicRoutePaths.has(suffix)) {
        return true;
    }

    // Parametric pattern match - only check patterns with the same segment count
    const segmentCount = suffix.split('/').filter(Boolean).length;
    const candidates = parametricEntriesBySegmentCount.get(segmentCount);
    if (!candidates) {
        return false;
    }

    return candidates.some((entry) => matchPathPattern(suffix, entry.path));
}

export {dynamicRoutePaths, parametricEntriesBySegmentCount};
export default isDynamicRouteSuffix;
