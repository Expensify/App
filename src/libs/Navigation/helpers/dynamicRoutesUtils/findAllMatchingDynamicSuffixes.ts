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
 * Collects all registered dynamic route suffixes that syntactically match the end of the given path,
 * across all three phases and in priority order:
 *   1. Static matches (`dynamicRoutePaths` Set lookup), longest to shortest.
 *   2. Strict parametric patterns (no optional params), longest to shortest.
 *   3. Optional parametric patterns (has at least one `:param?`), longest to shortest.
 *
 * Use this instead of `findMatchingDynamicSuffix` when you need to validate matches against
 * additional context (e.g. `entryScreens`) and fall back to the next candidate if the first
 * one doesn't satisfy the constraint. This prevents false-positive greedy matches where a
 * user-defined name (e.g. a tag named "gl-code") coincides with a registered static suffix.
 *
 * Each pattern appears at most once in the result array. The first element is always equal
 * to what `findMatchingDynamicSuffix` would return for the same path.
 *
 * @param path - The path to find all matching dynamic suffixes for
 * @returns Array of all matching dynamic suffixes in priority order (may be empty)
 */
function findAllMatchingDynamicSuffixes(path = ''): DynamicSuffixMatch[] {
    const [normalizedPath] = splitPathAndQuery(path);
    if (!normalizedPath) {
        return [];
    }

    const segments = normalizedPath.split('/').filter(Boolean);
    const results: DynamicSuffixMatch[] = [];
    const seenPatterns = new Set<string>();

    // Phase 1: Static matches (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const candidate = segments.slice(i).join('/');
        if (dynamicRoutePaths.has(candidate)) {
            results.push({pattern: candidate, actualSuffix: candidate, pathParams: {}});
            seenPatterns.add(candidate);
        }
    }

    // Phase 2: Strict parametric patterns - no optional params (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const match = tryMatchParametric(segments.slice(i).join('/'), segments.length - i, compiledStrictParametricDynamicRoutes);
        if (match && !seenPatterns.has(match.pattern)) {
            results.push(match);
            seenPatterns.add(match.pattern);
        }
    }

    // Phase 3: Optional parametric patterns - has at least one :param? (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const match = tryMatchParametric(segments.slice(i).join('/'), segments.length - i, compiledOptionalParametricDynamicRoutes);
        if (match && !seenPatterns.has(match.pattern)) {
            results.push(match);
            seenPatterns.add(match.pattern);
        }
    }

    return results;
}

/** Mirrors previous `findMatchingDynamicSuffix` logic - returns only the first (highest-priority) match. */
function findMatchingDynamicSuffix(path = ''): DynamicSuffixMatch | undefined {
    return findAllMatchingDynamicSuffixes(path).at(0);
}

export type {DynamicSuffixMatch};
export {findMatchingDynamicSuffix};
export default findAllMatchingDynamicSuffixes;
