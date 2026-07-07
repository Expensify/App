import getMatchScore from '../../src/libs/getMatchScore';

describe('getMatchScore', () => {
    test('returns 3 for exact case-sensitive match', () => {
        const result = getMatchScore('test', 'test');
        expect(result).toBe(3);
    });

    test('returns 3 for exact case-insensitive match', () => {
        const result = getMatchScore('Test', 'test');
        expect(result).toBe(3);
    });

    test('returns 3 for exact match with mixed case', () => {
        const result = getMatchScore('TEST', 'test');
        expect(result).toBe(3);
    });

    test('returns 2 for starts-with match', () => {
        const result = getMatchScore('testing', 'test');
        expect(result).toBe(2);
    });

    test('returns 2 for starts-with match with different case', () => {
        const result = getMatchScore('Testing', 'test');
        expect(result).toBe(2);
    });

    test('returns 2 for starts-with match with query in uppercase', () => {
        const result = getMatchScore('testing', 'TEST');
        expect(result).toBe(2);
    });

    test('returns 1 for contains match in the middle', () => {
        const result = getMatchScore('contest', 'test');
        expect(result).toBe(1);
    });

    test('returns 1 for contains match at the end', () => {
        const result = getMatchScore('latest', 'test');
        expect(result).toBe(1);
    });

    test('returns 1 for contains match with different case', () => {
        const result = getMatchScore('ConTest', 'test');
        expect(result).toBe(1);
    });

    test('returns 0 for no match', () => {
        const result = getMatchScore('hello', 'test');
        expect(result).toBe(0);
    });

    test('returns 0 for empty string', () => {
        const result = getMatchScore('', 'test');
        expect(result).toBe(0);
    });

    test('returns 3 for both empty string and query', () => {
        const result = getMatchScore('', '');
        expect(result).toBe(3);
    });

    test('prioritizes exact match over starts-with when applicable', () => {
        const result = getMatchScore('test', 'test');
        expect(result).toBe(3);
    });

    test('prioritizes starts-with over contains when applicable', () => {
        const result = getMatchScore('testing', 'test');
        expect(result).toBe(2);
    });

    test('handles special characters in exact match', () => {
        const result = getMatchScore('test@example.com', 'test@example.com');
        expect(result).toBe(3);
    });

    test('handles special characters in starts-with match', () => {
        const result = getMatchScore('test@example.com', 'test@');
        expect(result).toBe(2);
    });

    test('handles special characters in contains match', () => {
        const result = getMatchScore('user@test.com', 'test');
        expect(result).toBe(1);
    });

    test('handles whitespace in exact match', () => {
        const result = getMatchScore('hello world', 'hello world');
        expect(result).toBe(3);
    });

    test('handles whitespace in starts-with match', () => {
        const result = getMatchScore('hello world test', 'hello world');
        expect(result).toBe(2);
    });

    test('handles whitespace in contains match', () => {
        const result = getMatchScore('test hello world', 'hello world');
        expect(result).toBe(1);
    });
});
