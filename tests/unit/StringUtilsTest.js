"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var StringUtils_1 = require("@libs/StringUtils");
describe('StringUtils', function () {
    describe('hash', function () {
        it('is deterministic', function () {
            expect(StringUtils_1.default.hash('abc')).toEqual(StringUtils_1.default.hash('abc'));
        });
        it('weights characters by position', function () {
            expect(StringUtils_1.default.hash('abc')).not.toEqual(StringUtils_1.default.hash('cba'));
        });
        it('returns 0 for an empty string', function () {
            expect(StringUtils_1.default.hash('')).toEqual(0);
        });
        it('is always less than max', function () {
            var max = 1000;
            var result = StringUtils_1.default.hash('some-long-string-that-definitely-should-not-result-in-a-hash-over-max', max);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(max);
        });
        it('throws if max is zero', function () {
            expect(function () { return StringUtils_1.default.hash('test', 0); }).toThrow('max must be a positive integer');
        });
        it('throws if max is negative', function () {
            expect(function () { return StringUtils_1.default.hash('test', -5); }).toThrow('max must be a positive integer');
        });
        it('handles Unicode and emoji characters', function () {
            var emojiHash = StringUtils_1.default.hash('😊🌟');
            expect(typeof emojiHash).toBe('number');
            expect(emojiHash).toBeGreaterThan(0);
        });
    });
    describe('dedent', function () {
        it('removes common leading whitespace', function () {
            var input = "\n              line 1\n                line 2\n              line 3\n            ";
            expect(StringUtils_1.default.dedent(input)).toBe("line 1\n  line 2\nline 3\n");
        });
        it('handles no indentation', function () {
            var input = "line1\nline2\nline3";
            expect(StringUtils_1.default.dedent(input)).toBe('line1\nline2\nline3');
        });
        it('handles single line', function () {
            var input = "    single line";
            expect(StringUtils_1.default.dedent(input)).toBe('single line');
        });
        it('handles empty string', function () {
            expect(StringUtils_1.default.dedent('')).toBe('');
        });
        it('preserves internal blank lines', function () {
            var input = "\n                first\n\n                second\n            ";
            expect(StringUtils_1.default.dedent(input)).toBe("first\n\nsecond\n");
        });
    });
    describe('decodeUnicode', function () {
        it('decodes a single unicode escape sequence', function () {
            expect(StringUtils_1.default.decodeUnicode('\\u00E9')).toBe('é');
        });
        it('decodes multiple unicode escape sequences', function () {
            expect(StringUtils_1.default.decodeUnicode('Pr\\u00E9c\\u00E9dent')).toBe('Précédent');
        });
        it('returns unchanged string if there are no unicode sequences', function () {
            expect(StringUtils_1.default.decodeUnicode('Hello World')).toBe('Hello World');
        });
        it('handles mixed content with unicode and regular characters', function () {
            expect(StringUtils_1.default.decodeUnicode('Caf\\u00E9 Mocha')).toBe('Café Mocha');
        });
        it('does not decode malformed sequences', function () {
            expect(StringUtils_1.default.decodeUnicode('\\u00G1')).toBe('\\u00G1'); // invalid hex digit
            expect(StringUtils_1.default.decodeUnicode('\\u123')).toBe('\\u123'); // not 4 hex digits
        });
        it('handles repeated sequences correctly', function () {
            expect(StringUtils_1.default.decodeUnicode('\\u00E9 \\u00E9 \\u00E9')).toBe('é é é');
        });
        it('handles empty strings', function () {
            expect(StringUtils_1.default.decodeUnicode('')).toBe('');
        });
    });
});
