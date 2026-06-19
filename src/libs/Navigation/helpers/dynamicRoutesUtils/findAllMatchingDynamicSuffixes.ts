import {dynamicTabPatternToTabPaths} from '@libs/Navigation/linkingConfig/config';
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
    /** The path to pass to getPathWithoutDynamicSuffix. Equal to the original path unless a trailing tab segment was stripped. */
    pathUsedForMatching: string;
};

/**
 * Tries to match a candidate suffix against a list of compiled parametric patterns.
 * Returns the first match with extracted path params, or undefined.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function tryMatchParametric(candidate: string, candidateSegmentCount: number, patterns: CompiledEntry[]): Omit<DynamicSuffixMatch, 'pathUsedForMatching'> | undefined {
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
 * Strips the trailing tab segment from a path and retries matching against Phases 1–3.
 * Returns an empty array if stripping is not applicable.
 * Calls `findAllMatchingDynamicSuffixes` recursively with an empty map to prevent double-stripping.
 *
 * @private - Internal helper. Do not export or use outside this file.
 */
function tryStripTabSuffix(normalizedPath: string, query: string, tabPatternMap: Map<string, Set<string>>): DynamicSuffixMatch[] {
    if (tabPatternMap.size === 0) {
        return [];
    }
    const lastSlash = normalizedPath.lastIndexOf('/');
    if (lastSlash <= 0) {
        return [];
    }
    const lastSegment = normalizedPath.slice(lastSlash + 1);
    const pathWithoutTab = normalizedPath.slice(0, lastSlash);
    const fullPathWithoutTab = query ? `${pathWithoutTab}?${query}` : pathWithoutTab;
    const retriedResults = findAllMatchingDynamicSuffixes(pathWithoutTab, new Map());

    // Keep only matches whose pattern owns the stripped segment as a registered tab-child path.
    const validResults = retriedResults.filter((match) => tabPatternMap.get(match.pattern)?.has(lastSegment));
    return validResults.map((match) => ({...match, pathUsedForMatching: fullPathWithoutTab}));
}

/**
 * Collects all registered dynamic route suffixes that syntactically match the end of the given path.
 * First checks whether the path ends with a tab-navigator segment (i.e. the matched dynamic route
 * hosts a nested tab navigator), if so, strips the tab segment and returns the match immediately.
 * Otherwise collects matches across three phases in priority order:
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
 * @param tabPatternMap - Override for the tab-pattern map (defaults to the app-wide
 *   `dynamicTabPatternToTabPaths`).
 * @returns Array of all matching dynamic suffixes in priority order (may be empty)
 */
function findAllMatchingDynamicSuffixes(path = '', tabPatternMap: Map<string, Set<string>> = dynamicTabPatternToTabPaths): DynamicSuffixMatch[] {
    const [normalizedPath, query] = splitPathAndQuery(path);
    if (!normalizedPath) {
        return [];
    }

    // Handles dynamic routes that host a tab navigator: if the URL ends with a tab segment,
    // strip it and return the match immediately.
    const tabResults = tryStripTabSuffix(normalizedPath, query ?? '', tabPatternMap);
    if (tabResults.length > 0) {
        return tabResults;
    }

    const segments = normalizedPath.split('/').filter(Boolean);
    const results: DynamicSuffixMatch[] = [];
    const seenPatterns = new Set<string>();

    // Phase 1: Static matches (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const candidate = segments.slice(i).join('/');
        if (dynamicRoutePaths.has(candidate)) {
            results.push({pattern: candidate, actualSuffix: candidate, pathParams: {}, pathUsedForMatching: path});
            seenPatterns.add(candidate);
        }
    }

    // Phase 2: Strict parametric patterns - no optional params (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const match = tryMatchParametric(segments.slice(i).join('/'), segments.length - i, compiledStrictParametricDynamicRoutes);
        if (match && !seenPatterns.has(match.pattern)) {
            results.push({...match, pathUsedForMatching: path});
            seenPatterns.add(match.pattern);
        }
    }

    // Phase 3: Optional parametric patterns - has at least one :param? (longest to shortest)
    for (let i = 0; i < segments.length; i++) {
        const match = tryMatchParametric(segments.slice(i).join('/'), segments.length - i, compiledOptionalParametricDynamicRoutes);
        if (match && !seenPatterns.has(match.pattern)) {
            results.push({...match, pathUsedForMatching: path});
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
