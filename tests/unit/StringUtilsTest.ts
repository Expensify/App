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
});
