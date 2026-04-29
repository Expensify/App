type PatternMatch = {
    params: Record<string, string>;
};

/**
 * Matches a URL path candidate against a route pattern with :param placeholders.
 * Static segments must match exactly; :param segments capture any non-empty value.
 * Mirrors React Navigation's segment-by-segment matching approach.
 *
 * @param candidate - The actual URL suffix, e.g. 'flag/123/abc'
 * @param pattern - The registered pattern, e.g. 'flag/:reportID/:reportActionID'
 * @returns Match result with extracted params, or undefined if no match
 */
function matchPathPattern(candidate: string, pattern: string): PatternMatch | undefined {
    const candidateSegments = candidate.split('/').filter(Boolean);
    const patternSegments = pattern.split('/').filter(Boolean);

    // Quick reject: different segment counts can never match.
    if (candidateSegments.length !== patternSegments.length) {
        return undefined;
    }

    const params: Record<string, string> = {};

    for (let i = 0; i < patternSegments.length; i++) {
        const patternSeg = patternSegments.at(i) ?? '';
        const candidateSeg = candidateSegments.at(i) ?? '';

        if (patternSeg.startsWith(':')) {
            try {
                params[patternSeg.slice(1)] = decodeURIComponent(candidateSeg);
            } catch {
                return undefined;
            }
        } else if (patternSeg !== candidateSeg) {
            return undefined;
        }
    }

    return {params};
}

export default matchPathPattern;
export type {PatternMatch};
