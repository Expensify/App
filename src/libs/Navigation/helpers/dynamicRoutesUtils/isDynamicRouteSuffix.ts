import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import matchPathPattern from './matchPathPattern';

const dynamicRouteEntries = Object.values(DYNAMIC_ROUTES);
const dynamicRoutePaths = new Set<string>(dynamicRouteEntries.map((r) => r.path));

type DynamicRouteEntry = (typeof DYNAMIC_ROUTES)[keyof typeof DYNAMIC_ROUTES];

const parametricEntries = dynamicRouteEntries.filter((entry) => entry.path.includes(':'));
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
 */
function isDynamicRouteSuffix(suffix: string): suffix is DynamicRouteSuffix {
    if (dynamicRoutePaths.has(suffix)) {
        return true;
    }

    const segmentCount = suffix.split('/').filter(Boolean).length;
    const candidates = parametricEntriesBySegmentCount.get(segmentCount);
    if (!candidates) {
        return false;
    }

    return candidates.some((entry) => matchPathPattern(suffix, entry.path));
}

export {dynamicRoutePaths, parametricEntriesBySegmentCount};
export default isDynamicRouteSuffix;
