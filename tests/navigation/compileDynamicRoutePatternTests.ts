import compileDynamicRoutePattern from '@libs/Navigation/helpers/dynamicRoutesUtils/compileDynamicRoutePattern';

/**
 * Helper: try to match a candidate against a compiled regex.
 * Mirrors how findMatchingDynamicSuffix tests the regex (always with a trailing slash).
 */
function execMatch(compiled: ReturnType<typeof compileDynamicRoutePattern>, candidate: string): Record<string, string> | undefined {
    const normalized = candidate.endsWith('/') ? candidate : `${candidate}/`;
    const m = compiled.regex.exec(normalized);
    if (!m) {
        return undefined;
    }
    const params: Record<string, string> = {};
    for (const name of compiled.paramNames) {
        const v = m.groups?.[name];
        if (v !== undefined) {
            params[name] = decodeURIComponent(v);
        }
    }
    return params;
}

describe('compileDynamicRoutePattern', () => {
    describe('static-only patterns', () => {
        it('compiles a single-segment static path', () => {
            const compiled = compileDynamicRoutePattern('verify-account');

            expect(compiled.pattern).toBe('verify-account');
            expect(compiled.paramNames).toEqual([]);
            expect(compiled.minSegments).toBe(1);
            expect(compiled.maxSegments).toBe(1);
            expect(execMatch(compiled, 'verify-account')).toEqual({});
            expect(execMatch(compiled, 'other')).toBeUndefined();
        });

        it('compiles a multi-segment static path', () => {
            const compiled = compileDynamicRoutePattern('add-bank-account/verify-account');

            expect(compiled.paramNames).toEqual([]);
            expect(compiled.minSegments).toBe(2);
            expect(compiled.maxSegments).toBe(2);
            expect(execMatch(compiled, 'add-bank-account/verify-account')).toEqual({});
            expect(execMatch(compiled, 'add-bank-account')).toBeUndefined();
            expect(execMatch(compiled, 'add-bank-account/verify-account/extra')).toBeUndefined();
        });
    });

    describe('required path params', () => {
        it('compiles a single required param', () => {
            const compiled = compileDynamicRoutePattern('flag/:reportID');

            expect(compiled.paramNames).toEqual(['reportID']);
            expect(compiled.minSegments).toBe(2);
            expect(compiled.maxSegments).toBe(2);
            expect(execMatch(compiled, 'flag/123')).toEqual({reportID: '123'});
            expect(execMatch(compiled, 'flag')).toBeUndefined();
            expect(execMatch(compiled, 'flag/123/extra')).toBeUndefined();
        });

        it('compiles two consecutive required params', () => {
            const compiled = compileDynamicRoutePattern('flag/:reportID/:reportActionID');

            expect(compiled.paramNames).toEqual(['reportID', 'reportActionID']);
            expect(compiled.minSegments).toBe(3);
            expect(compiled.maxSegments).toBe(3);
            expect(execMatch(compiled, 'flag/123/abc')).toEqual({reportID: '123', reportActionID: 'abc'});
            expect(execMatch(compiled, 'flag/123')).toBeUndefined();
        });

        it('compiles a pattern with static prefix + required + static suffix', () => {
            const compiled = compileDynamicRoutePattern('members/:accountID/edit');

            expect(compiled.paramNames).toEqual(['accountID']);
            expect(compiled.minSegments).toBe(3);
            expect(compiled.maxSegments).toBe(3);
            expect(execMatch(compiled, 'members/456/edit')).toEqual({accountID: '456'});
            expect(execMatch(compiled, 'members/456/other')).toBeUndefined();
        });
    });

    describe('trailing optional params', () => {
        it('compiles a single trailing optional', () => {
            const compiled = compileDynamicRoutePattern('member-details/:accountID?');

            expect(compiled.paramNames).toEqual(['accountID']);
            expect(compiled.minSegments).toBe(1);
            expect(compiled.maxSegments).toBe(2);
            expect(execMatch(compiled, 'member-details/123')).toEqual({accountID: '123'});
            expect(execMatch(compiled, 'member-details')).toEqual({});
            expect(execMatch(compiled, 'member-details/123/extra')).toBeUndefined();
            expect(execMatch(compiled, 'other')).toBeUndefined();
        });

        it('compiles a required + trailing optional combo', () => {
            const compiled = compileDynamicRoutePattern('flag/:reportID/:reportActionID?');

            expect(compiled.paramNames).toEqual(['reportID', 'reportActionID']);
            expect(compiled.minSegments).toBe(2);
            expect(compiled.maxSegments).toBe(3);
            expect(execMatch(compiled, 'flag/123/abc')).toEqual({reportID: '123', reportActionID: 'abc'});
            expect(execMatch(compiled, 'flag/123')).toEqual({reportID: '123'});
            expect(execMatch(compiled, 'flag')).toBeUndefined();
        });
    });

    describe('middle optional params', () => {
        it('compiles a single middle optional', () => {
            const compiled = compileDynamicRoutePattern('c/:p?/d');

            expect(compiled.paramNames).toEqual(['p']);
            expect(compiled.minSegments).toBe(2);
            expect(compiled.maxSegments).toBe(3);
            expect(execMatch(compiled, 'c/x/d')).toEqual({p: 'x'});
            expect(execMatch(compiled, 'c/d')).toEqual({});
            expect(execMatch(compiled, 'c')).toBeUndefined();
            expect(execMatch(compiled, 'c/x/y/d')).toBeUndefined();
        });

        it('compiles middle optional with surrounding required params', () => {
            const compiled = compileDynamicRoutePattern(':a/:p?/:b');

            expect(compiled.paramNames).toEqual(['a', 'p', 'b']);
            expect(compiled.minSegments).toBe(2);
            expect(compiled.maxSegments).toBe(3);
            expect(execMatch(compiled, '1/2/3')).toEqual({a: '1', p: '2', b: '3'});
            expect(execMatch(compiled, '1/3')).toEqual({a: '1', b: '3'});
        });
    });

    describe('multiple optional params', () => {
        it('compiles two consecutive trailing optionals', () => {
            const compiled = compileDynamicRoutePattern('a/:p1?/:p2?');

            expect(compiled.paramNames).toEqual(['p1', 'p2']);
            expect(compiled.minSegments).toBe(1);
            expect(compiled.maxSegments).toBe(3);
            expect(execMatch(compiled, 'a')).toEqual({});
            expect(execMatch(compiled, 'a/x')).toEqual({p1: 'x'});
            expect(execMatch(compiled, 'a/x/y')).toEqual({p1: 'x', p2: 'y'});
            expect(execMatch(compiled, 'a/x/y/z')).toBeUndefined();
        });

        it('compiles mixed positions of optionals', () => {
            const compiled = compileDynamicRoutePattern('a/:p1?/b/:p2?');

            expect(compiled.paramNames).toEqual(['p1', 'p2']);
            expect(compiled.minSegments).toBe(2);
            expect(compiled.maxSegments).toBe(4);
            expect(execMatch(compiled, 'a/b')).toEqual({});
            expect(execMatch(compiled, 'a/x/b')).toEqual({p1: 'x'});
            expect(execMatch(compiled, 'a/b/y')).toEqual({p2: 'y'});
            expect(execMatch(compiled, 'a/x/b/y')).toEqual({p1: 'x', p2: 'y'});
        });

        it('compiles three trailing optionals', () => {
            const compiled = compileDynamicRoutePattern('root/:a?/:b?/:c?');

            expect(compiled.paramNames).toEqual(['a', 'b', 'c']);
            expect(compiled.minSegments).toBe(1);
            expect(compiled.maxSegments).toBe(4);
            expect(execMatch(compiled, 'root')).toEqual({});
            expect(execMatch(compiled, 'root/1')).toEqual({a: '1'});
            expect(execMatch(compiled, 'root/1/2')).toEqual({a: '1', b: '2'});
            expect(execMatch(compiled, 'root/1/2/3')).toEqual({a: '1', b: '2', c: '3'});
        });
    });

    describe('URL encoding', () => {
        it('decodes URI-encoded values in required params', () => {
            const compiled = compileDynamicRoutePattern('flag/:name');

            expect(execMatch(compiled, 'flag/hello%20world')).toEqual({name: 'hello world'});
        });

        it('decodes URI-encoded values in optional params', () => {
            const compiled = compileDynamicRoutePattern('flag/:name?');

            expect(execMatch(compiled, 'flag/hello%20world')).toEqual({name: 'hello world'});
        });
    });

    describe('error cases', () => {
        it('throws on stray colon at end of pattern', () => {
            expect(() => compileDynamicRoutePattern('a/:')).toThrow();
        });

        it('throws on optional marker without param name', () => {
            expect(() => compileDynamicRoutePattern('a/:?')).toThrow();
        });

        it('throws on duplicate param name', () => {
            expect(() => compileDynamicRoutePattern('a/:p/b/:p')).toThrow();
        });

        it('throws on empty pattern', () => {
            expect(() => compileDynamicRoutePattern('')).toThrow();
        });
    });
});
