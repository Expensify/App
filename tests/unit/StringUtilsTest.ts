import StringUtils from '@libs/StringUtils';

describe('StringUtils', () => {
    describe('hash', () => {
        it('is deterministic', () => {
            expect(StringUtils.hash('abc')).toEqual(StringUtils.hash('abc'));
        });
        it('weights characters by position', () => {
            expect(StringUtils.hash('abc')).not.toEqual(StringUtils.hash('cba'));
        });
        it('returns 0 for an empty string', () => {
            expect(StringUtils.hash('')).toEqual(0);
        });
        it('is always less than max', () => {
            const max = 1000;
            const result = StringUtils.hash('some-long-string-that-definitely-should-not-result-in-a-hash-over-max', max);
            expect(result).toBeGreaterThanOrEqual(0);
            expect(result).toBeLessThan(max);
        });
        it('throws if max is zero', () => {
            expect(() => StringUtils.hash('test', 0)).toThrow('max must be a positive integer');
        });
        it('throws if max is negative', () => {
            expect(() => StringUtils.hash('test', -5)).toThrow('max must be a positive integer');
        });
        it('handles Unicode and emoji characters', () => {
            const emojiHash = StringUtils.hash('😊🌟');
            expect(typeof emojiHash).toBe('number');
            expect(emojiHash).toBeGreaterThan(0);
        });
    });

    describe('dedent', () => {
        it('removes common leading whitespace', () => {
            const input = `
              line 1
                line 2
              line 3
            `;
            expect(StringUtils.dedent(input)).toBe(
                `line 1
  line 2
line 3
`,
            );
        });

        it('handles no indentation', () => {
            const input = `line1\nline2\nline3`;
            expect(StringUtils.dedent(input)).toBe('line1\nline2\nline3');
        });

        it('handles single line', () => {
            const input = `    single line`;
            expect(StringUtils.dedent(input)).toBe('single line');
        });

        it('handles empty string', () => {
            expect(StringUtils.dedent('')).toBe('');
        });

        it('preserves internal blank lines', () => {
            const input = `
                first

                second
            `;
            expect(StringUtils.dedent(input)).toBe(`first

second
`);
        });
    });

    describe('decodeUnicode', () => {
        it('decodes a single unicode escape sequence', () => {
            expect(StringUtils.decodeUnicode('\\u00E9')).toBe('é');
        });

        it('decodes multiple unicode escape sequences', () => {
            expect(StringUtils.decodeUnicode('Pr\\u00E9c\\u00E9dent')).toBe('Précédent');
        });

        it('returns unchanged string if there are no unicode sequences', () => {
            expect(StringUtils.decodeUnicode('Hello World')).toBe('Hello World');
        });

        it('handles mixed content with unicode and regular characters', () => {
            expect(StringUtils.decodeUnicode('Caf\\u00E9 Mocha')).toBe('Café Mocha');
        });

        it('does not decode malformed sequences', () => {
            expect(StringUtils.decodeUnicode('\\u00G1')).toBe('\\u00G1'); // invalid hex digit
            expect(StringUtils.decodeUnicode('\\u123')).toBe('\\u123'); // not 4 hex digits
        });

        it('handles repeated sequences correctly', () => {
            expect(StringUtils.decodeUnicode('\\u00E9 \\u00E9 \\u00E9')).toBe('é é é');
        });

        it('handles empty strings', () => {
            expect(StringUtils.decodeUnicode('')).toBe('');
        });
    });

    describe('startsWithVowel', () => {
        it('returns true for strings starting with lowercase vowels', () => {
            expect(StringUtils.startsWithVowel('apple')).toBe(true);
            expect(StringUtils.startsWithVowel('elephant')).toBe(true);
            expect(StringUtils.startsWithVowel('igloo')).toBe(true);
            expect(StringUtils.startsWithVowel('orange')).toBe(true);
            expect(StringUtils.startsWithVowel('umbrella')).toBe(true);
        });

        it('returns true for strings starting with uppercase vowels', () => {
            expect(StringUtils.startsWithVowel('Apple')).toBe(true);
            expect(StringUtils.startsWithVowel('Elephant')).toBe(true);
            expect(StringUtils.startsWithVowel('Igloo')).toBe(true);
            expect(StringUtils.startsWithVowel('Orange')).toBe(true);
            expect(StringUtils.startsWithVowel('Umbrella')).toBe(true);
        });

        it('returns false for strings starting with other letters', () => {
            expect(StringUtils.startsWithVowel('banana')).toBe(false);
            expect(StringUtils.startsWithVowel('cat')).toBe(false);
            expect(StringUtils.startsWithVowel('dog')).toBe(false);
            expect(StringUtils.startsWithVowel('zebra')).toBe(false);
            expect(StringUtils.startsWithVowel('123')).toBe(false);
            expect(StringUtils.startsWithVowel('@example')).toBe(false);
        });
    });
});
