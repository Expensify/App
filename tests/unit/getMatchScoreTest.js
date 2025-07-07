"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var getMatchScore_1 = require("../../src/libs/getMatchScore");
describe('getMatchScore', function () {
    test('returns 3 for exact case-sensitive match', function () {
        var result = (0, getMatchScore_1.default)('test', 'test');
        expect(result).toBe(3);
    });
    test('returns 3 for exact case-insensitive match', function () {
        var result = (0, getMatchScore_1.default)('Test', 'test');
        expect(result).toBe(3);
    });
    test('returns 3 for exact match with mixed case', function () {
        var result = (0, getMatchScore_1.default)('TEST', 'test');
        expect(result).toBe(3);
    });
    test('returns 2 for starts-with match', function () {
        var result = (0, getMatchScore_1.default)('testing', 'test');
        expect(result).toBe(2);
    });
    test('returns 2 for starts-with match with different case', function () {
        var result = (0, getMatchScore_1.default)('Testing', 'test');
        expect(result).toBe(2);
    });
    test('returns 2 for starts-with match with query in uppercase', function () {
        var result = (0, getMatchScore_1.default)('testing', 'TEST');
        expect(result).toBe(2);
    });
    test('returns 1 for contains match in the middle', function () {
        var result = (0, getMatchScore_1.default)('contest', 'test');
        expect(result).toBe(1);
    });
    test('returns 1 for contains match at the end', function () {
        var result = (0, getMatchScore_1.default)('latest', 'test');
        expect(result).toBe(1);
    });
    test('returns 1 for contains match with different case', function () {
        var result = (0, getMatchScore_1.default)('ConTest', 'test');
        expect(result).toBe(1);
    });
    test('returns 0 for no match', function () {
        var result = (0, getMatchScore_1.default)('hello', 'test');
        expect(result).toBe(0);
    });
    test('returns 0 for empty string', function () {
        var result = (0, getMatchScore_1.default)('', 'test');
        expect(result).toBe(0);
    });
    test('returns 3 for both empty string and query', function () {
        var result = (0, getMatchScore_1.default)('', '');
        expect(result).toBe(3);
    });
    test('prioritizes exact match over starts-with when applicable', function () {
        var result = (0, getMatchScore_1.default)('test', 'test');
        expect(result).toBe(3);
    });
    test('prioritizes starts-with over contains when applicable', function () {
        var result = (0, getMatchScore_1.default)('testing', 'test');
        expect(result).toBe(2);
    });
    test('handles special characters in exact match', function () {
        var result = (0, getMatchScore_1.default)('test@example.com', 'test@example.com');
        expect(result).toBe(3);
    });
    test('handles special characters in starts-with match', function () {
        var result = (0, getMatchScore_1.default)('test@example.com', 'test@');
        expect(result).toBe(2);
    });
    test('handles special characters in contains match', function () {
        var result = (0, getMatchScore_1.default)('user@test.com', 'test');
        expect(result).toBe(1);
    });
    test('handles whitespace in exact match', function () {
        var result = (0, getMatchScore_1.default)('hello world', 'hello world');
        expect(result).toBe(3);
    });
    test('handles whitespace in starts-with match', function () {
        var result = (0, getMatchScore_1.default)('hello world test', 'hello world');
        expect(result).toBe(2);
    });
    test('handles whitespace in contains match', function () {
        var result = (0, getMatchScore_1.default)('test hello world', 'hello world');
        expect(result).toBe(1);
    });
});
