import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type {DynamicRouteSuffix} from '@src/ROUTES';
import {compiledOptionalParametricDynamicRoutes, compiledStrictParametricDynamicRoutes} from './compileDynamicRoutePattern';

const dynamicRouteEntries = Object.values(DYNAMIC_ROUTES);

// A Set of all static dynamic-route paths (e.g. 'country', 'verify-account') for O(1) lookups.
const dynamicRoutePaths = new Set<string>(dynamicRouteEntries.map((r) => r.path));

/**
 * Checks if a suffix matches any dynamic route path in DYNAMIC_ROUTES.
 * Supports exact static matches, strict parametric matches, and optional parametric matches,
 * checked in that priority order.
 *
 * @param suffix - The suffix to check
 * @returns True if the suffix matches any dynamic route path, false otherwise
 */
function isDynamicRouteSuffix(suffix: string): suffix is DynamicRouteSuffix {
    // Exact static match
    if (dynamicRoutePaths.has(suffix)) {
        return true;
    }

    const segmentCount = suffix.split('/').filter(Boolean).length;
    // Append trailing '/' because compiled regexes expect each segment to end with '/'.
    const normalizedSuffix = suffix.endsWith('/') ? suffix : `${suffix}/`;

    // Strict parametric match (no optional params)
    for (const {compiled} of compiledStrictParametricDynamicRoutes) {
        if (segmentCount < compiled.minSegments || segmentCount > compiled.maxSegments) {
            continue;
        }
        if (compiled.regex.test(normalizedSuffix)) {
            return true;
        }
    }

    // Optional parametric match (has at least one :param?)
    for (const {compiled} of compiledOptionalParametricDynamicRoutes) {
        if (segmentCount < compiled.minSegments || segmentCount > compiled.maxSegments) {
            continue;
        }
        if (compiled.regex.test(normalizedSuffix)) {
            return true;
        }
    }

    return false;
}

export {dynamicRoutePaths};
export default isDynamicRouteSuffix;
