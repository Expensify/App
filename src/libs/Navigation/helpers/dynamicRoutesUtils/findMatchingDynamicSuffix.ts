import type {CompiledEntry} from './compileDynamicRoutePattern';
import {compiledOptionalParametricDynamicRoutes, compiledStrictParametricDynamicRoutes} from './compileDynamicRoutePattern';
import {dynamicRoutePaths} from './isDynamicRouteSuffix';
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
 * Tries to match a candidate suffix against a list of compiled parametric patterns.
 * Returns the first match with extracted path params, or undefined.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function tryMatchParametric(candidate: string, candidateSegmentCount: number, patterns: CompiledEntry[]): DynamicSuffixMatch | undefined {
    const normalized = candidate.endsWith('/') ? candidate : `${candidate}/`;

    for (const {compiled} of patterns) {
        if (candidateSegmentCount < compiled.minSegments || candidateSegmentCount > compiled.maxSegments) {
            continue;
        }
        const match = compiled.regex.exec(normalized);
        if (!match) {
            continue;
        }
        const pathParams: Record<string, string> = {};
        for (const name of compiled.paramNames) {
            const value = match.groups?.[name];
            if (value === undefined) {
                continue;
            }
            try {
                pathParams[name] = decodeURIComponent(value);
            } catch {
                pathParams[name] = value;
            }
        }
        return {pattern: compiled.pattern, actualSuffix: candidate, pathParams};
    }

    return undefined;
}

/**
 * Finds a registered dynamic route suffix that matches the end of the given path.
 *
 * Uses three-phase matching with decreasing specificity. Each phase iterates
 * all sub-suffixes from longest to shortest before the next phase begins:
 *   1. Static matches (`dynamicRoutePaths` Set lookup).
 *   2. Strict parametric patterns (no optional params).
 *   3. Optional parametric patterns (has at least one `:param?`).
 *
 * This guarantees that any static match, even a short one, always beats
 * a parametric match, and any strict-parametric match always beats an
 * optional-parametric match.
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

    // Phase 1: Static matches (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const candidate = segments.slice(i).join('/');
        if (dynamicRoutePaths.has(candidate)) {
            return {pattern: candidate, actualSuffix: candidate, pathParams: {}};
        }
    }

    // Phase 2: Strict parametric patterns - no optional params (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const result = tryMatchParametric(segments.slice(i).join('/'), segments.length - i, compiledStrictParametricDynamicRoutes);
        if (result) {
            return result;
        }
    }

    // Phase 3: Optional parametric patterns - has at least one :param? (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const result = tryMatchParametric(segments.slice(i).join('/'), segments.length - i, compiledOptionalParametricDynamicRoutes);
        if (result) {
            return result;
        }
    }

    return undefined;
}

export default findMatchingDynamicSuffix;
export type {DynamicSuffixMatch};
