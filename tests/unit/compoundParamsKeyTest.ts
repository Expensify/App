// Typed require with explicit .ts path — matches the project's test-file convention.
/* eslint-disable import/extensions */
const {default: compoundParamsKey, normalizeForKey, COMPOUND_KEY_DELIMITER} = require<{
    default: (routeKey: string, params: unknown) => string;
    normalizeForKey: (value: unknown) => unknown;
    COMPOUND_KEY_DELIMITER: string;
}>('../../src/libs/compoundParamsKey.ts');
/* eslint-enable import/extensions */
const D = COMPOUND_KEY_DELIMITER;

describe('compoundParamsKey', () => {
    describe('null / undefined params', () => {
        it('returns "<route><DELIM>" when params are null', () => {
            expect(compoundParamsKey('search-1', null)).toBe(`search-1${D}`);
        });

        it('returns "<route><DELIM>" when params are undefined', () => {
            expect(compoundParamsKey('search-1', undefined)).toBe(`search-1${D}`);
        });
    });

    describe('primitive params', () => {
        it('coerces number to string in compound', () => {
            expect(compoundParamsKey('r', 42)).toBe(compoundParamsKey('r', '42'));
        });

        it('coerces boolean to string in compound', () => {
            expect(compoundParamsKey('r', true)).toBe(compoundParamsKey('r', 'true'));
        });

        it('preserves string params as-is', () => {
            expect(compoundParamsKey('r', 'hello')).toBe(`r${D}"hello"`);
        });
    });

    describe('object params', () => {
        it('produces the same compound for differently-ordered keys (recursive sort)', () => {
            const a = compoundParamsKey('r', {b: 1, a: 2});
            const b = compoundParamsKey('r', {a: 2, b: 1});
            expect(a).toBe(b);
        });

        it('produces the same compound for nested differently-ordered keys', () => {
            const a = compoundParamsKey('r', {outer: {b: 1, a: 2}});
            const b = compoundParamsKey('r', {outer: {a: 2, b: 1}});
            expect(a).toBe(b);
        });

        it('drops top-level explicit-undefined fields so URL-rehydrated (omitted) and dispatched (undefined) params produce the same key', () => {
            const explicitUndefined = compoundParamsKey('r', {q: 'foo', filter: undefined});
            const omitted = compoundParamsKey('r', {q: 'foo'});
            expect(explicitUndefined).toBe(omitted);
        });

        it('treats different param values as different compounds', () => {
            expect(compoundParamsKey('r', {q: 'a'})).not.toBe(compoundParamsKey('r', {q: 'b'}));
        });

        it('treats different route keys as different compounds (same params)', () => {
            expect(compoundParamsKey('r1', {q: 'a'})).not.toBe(compoundParamsKey('r2', {q: 'a'}));
        });
    });

    describe('array params', () => {
        it('treats arrays of numbers and arrays of string-of-numbers as equivalent', () => {
            expect(compoundParamsKey('r', {ids: [1, 2, 3]})).toBe(compoundParamsKey('r', {ids: ['1', '2', '3']}));
        });

        it('preserves array structure (does not collapse to object keys)', () => {
            const asArray = compoundParamsKey('r', {ids: [1, 2]});
            const asObject = compoundParamsKey('r', {
                ids: Object.fromEntries([
                    [0, 1],
                    [1, 2],
                ]),
            });
            expect(asArray).not.toBe(asObject);
        });

        it('preserves order within arrays', () => {
            expect(compoundParamsKey('r', {ids: [1, 2]})).not.toBe(compoundParamsKey('r', {ids: [2, 1]}));
        });
    });
});

describe('normalizeForKey', () => {
    it('returns null for null', () => {
        expect(normalizeForKey(null)).toBeNull();
    });

    it("returns the UNDEFINED_SENTINEL for undefined (so JSON.stringify doesn't collapse [undefined] to [null])", () => {
        const result = normalizeForKey(undefined);
        expect(typeof result).toBe('string');
        expect(result).not.toBeNull();
        // Round-trip: JSON.stringify on [undefined] would normally produce [null]; the sentinel keeps them distinct.
        expect(JSON.stringify([normalizeForKey(undefined)])).not.toBe('[null]');
    });

    it('coerces numbers and booleans to strings', () => {
        expect(normalizeForKey(42)).toBe('42');
        expect(normalizeForKey(true)).toBe('true');
        expect(normalizeForKey(false)).toBe('false');
    });

    it('passes strings through unchanged', () => {
        expect(normalizeForKey('hello')).toBe('hello');
    });

    it('recurses into arrays', () => {
        expect(normalizeForKey([1, true, 'x'])).toEqual(['1', 'true', 'x']);
    });

    it('sorts object keys recursively', () => {
        const result = normalizeForKey({c: 1, a: 2, b: 3});
        expect(Object.keys(result as Record<string, unknown>)).toEqual(['a', 'b', 'c']);
    });

    it('preserves explicit-undefined nested values via the sentinel', () => {
        const result = normalizeForKey([undefined, 1]) as unknown[];
        expect(result.at(0)).not.toBeNull();
        expect(result.at(0)).not.toBeUndefined();
    });
});
