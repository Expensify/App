import SafeString from '../../src/utils/SafeString';

describe('SafeString', () => {
    test('returns empty string for undefined and null', () => {
        expect(SafeString(undefined)).toBe('');
        expect(SafeString(null)).toBe('');
    });

    test('handles strings directly', () => {
        expect(SafeString('hello')).toBe('hello');
        expect(SafeString('')).toBe('');
    });

    test('handles numbers, booleans, functions, bigint, symbol', () => {
        expect(SafeString(123)).toBe('123');
        expect(SafeString(0)).toBe('0');
        expect(SafeString(true)).toBe('true');
        expect(SafeString(false)).toBe('false');
        expect(SafeString(() => 1)).toBe(`function () {
      return 1;
    }`);
        expect(SafeString(BigInt(10))).toBe('10');
        const sym = Symbol('x');
        expect(SafeString(sym)).toBe(String(sym));
    });

    test('handles arrays via JSON, including nested', () => {
        expect(SafeString([1, 'a', true])).toBe('[1,"a",true]');
        expect(SafeString([1, {a: 2}])).toBe('[1,{"a":2}]');
    });

    test('arrays with circular refs fall back to [object Array]', () => {
        const arr: unknown[] = [1];
        arr.push(arr);
        expect(SafeString(arr)).toBe('[object Array]');
    });

    test('Plain JavaScript objects stringify to JSON', () => {
        expect(SafeString({a: 1, b: 'x'})).toBe('{"a":1,"b":"x"}');
    });

    test('objects with custom toString use it', () => {
        const obj = {
            toString() {
                return 'custom';
            },
        };
        expect(SafeString(obj)).toBe('custom');
    });

    test('objects with circular refs fall back to [object Object]', () => {
        const obj: {self?: unknown; a?: number} = {a: 1};
        obj.self = obj;
        expect(SafeString(obj)).toBe('[object Object]');
    });

    test('comparisons should fallback the same way as value?.toString() for undefined', () => {
        const testValue: unknown = undefined;
        const comparisonWithSafeString = SafeString(testValue) || 'fallback';
        const comparisonWithToString = testValue?.toString() ?? 'fallback';

        expect(comparisonWithSafeString).toBe('fallback');
        expect(comparisonWithToString).toBe('fallback');
        expect(comparisonWithSafeString).toBe(comparisonWithToString);
    });
    test('comparisons with nullish coalescing operator should fallback the same way for undefined', () => {
        const testValue: unknown = undefined;
        const comparisonWithSafeString = SafeString(testValue);
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        const comparisonWithToString = String(testValue ?? '');

        expect(comparisonWithSafeString).toBe('');
        expect(comparisonWithToString).toBe('');
        expect(comparisonWithSafeString).toBe(comparisonWithToString);
    });

    test('returns same results as String() for dates', () => {
        const now = new Date();
        expect(SafeString(now)).toBe(String(now));
    });

    test('returns same results as String() for errors', () => {
        const error = new Error('test');
        expect(SafeString(error)).toBe(String(error));
    });

    test('returns same results as String() for collection objects', () => {
        expect(SafeString(new Map())).toBe('[object Map]');
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(SafeString(new Map())).toBe(String(new Map()));

        expect(SafeString(new Set())).toBe('[object Set]');
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        expect(SafeString(new Set())).toBe(String(new Set()));
    });

    test('returns same results as String() for regexes', () => {
        const regex = /test/;
        expect(SafeString(regex)).toBe(String(regex));
    });
});
