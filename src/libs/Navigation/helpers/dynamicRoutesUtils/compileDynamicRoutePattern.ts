import StringUtils from '@libs/StringUtils';
import {DYNAMIC_ROUTES} from '@src/ROUTES';

/**
 * Compiles a dynamic-route suffix pattern (e.g. `flag/:reportID/:reportActionID?`) into a regex.
 * Used to detect and strip dynamic suffixes from URL paths.
 */

type CompiledPattern = {
    /** Original pattern string, e.g. `'a/:p?/b'`. */
    pattern: string;

    /** Compiled regex. */
    regex: RegExp;

    /** Names of all `:param` and `:param?` placeholders in declaration order. */
    paramNames: string[];

    /** Minimum number of URL segments that can satisfy this pattern (all optionals absent). */
    minSegments: number;

    /** Maximum number of URL segments that can satisfy this pattern (all optionals present). */
    maxSegments: number;
};

function compileDynamicRoutePattern(pattern: string): CompiledPattern {
    if (!pattern) {
        throw new Error(`[compileDynamicRoutePattern] Pattern must be a non-empty string, got "${pattern}"`);
    }

    const segments = pattern.split('/');

    // Reject patterns with empty segments (e.g. 'a//b'), but allow a trailing slash.
    if (segments.some((s, i) => s === '' && i !== segments.length - 1)) {
        throw new Error(`[compileDynamicRoutePattern] Pattern "${pattern}" contains an empty segment`);
    }

    const paramNames: string[] = [];
    const seenParamNames = new Set<string>();
    let minSegments = 0;
    let maxSegments = 0;
    let regexBody = '';

    for (const segment of segments) {
        if (segment === '') {
            continue;
        }

        if (segment.startsWith(':')) {
            const optional = segment.endsWith('?');
            const name = optional ? segment.slice(1, -1) : segment.slice(1);

            if (!name || name.includes(':')) {
                throw new Error(`[compileDynamicRoutePattern] Pattern "${pattern}" contains a malformed param "${segment}"`);
            }
            if (seenParamNames.has(name)) {
                throw new Error(`[compileDynamicRoutePattern] Pattern "${pattern}" declares duplicate param "${name}"`);
            }
            seenParamNames.add(name);
            paramNames.push(name);

            if (optional) {
                regexBody += `(?:(?<${name}>[^/]+)\\/)?`;
                maxSegments += 1;
            } else {
                regexBody += `(?<${name}>[^/]+)\\/`;
                minSegments += 1;
                maxSegments += 1;
            }
        } else {
            regexBody += `${StringUtils.escapeRegExp(segment)}\\/`;
            minSegments += 1;
            maxSegments += 1;
        }
    }

    if (paramNames.length === 0 && minSegments === 0) {
        throw new Error(`[compileDynamicRoutePattern] Pattern "${pattern}" has no segments`);
    }

    const regex = new RegExp(`^${regexBody}$`);
    return {pattern, regex, paramNames, minSegments, maxSegments};
}

type CompiledEntry = {key: string; compiled: CompiledPattern};

const compiledParametricDynamicRoutes: CompiledEntry[] = Object.entries(DYNAMIC_ROUTES)
    .filter(([, entry]) => entry.path.includes(':'))
    .map(([key, entry]) => ({key, compiled: compileDynamicRoutePattern(entry.path)}));

const compiledStrictParametricDynamicRoutes = compiledParametricDynamicRoutes.filter(({compiled}) => compiled.minSegments === compiled.maxSegments);
const compiledOptionalParametricDynamicRoutes = compiledParametricDynamicRoutes.filter(({compiled}) => compiled.minSegments < compiled.maxSegments);

export default compileDynamicRoutePattern;
export {compiledStrictParametricDynamicRoutes, compiledOptionalParametricDynamicRoutes};
export type {CompiledEntry};
