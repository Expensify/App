import * as NumberUtils from '../../src/libs/NumberUtils';

describe('libs/NumberUtils', () => {
    it('should generate a random 64-bit numeric string', () => {
        const id = NumberUtils.rand64();
        expect(typeof id).toBe('string');

        expect(BigInt(id)).toBeLessThanOrEqual(BigInt('9223372036854775807'));

        expect(BigInt(id)).toBeGreaterThanOrEqual(0);
    });

    it('should return 8 followed by 0s with as many digits as the value', () => {
        // Given counts with one, two and three digits. 0 is Expensify Neue's widest digit and 8 its widest non-zero one,
        // so 8 followed by 0s is the widest number a counter could show with that many digits
        const counts = [5, 12, 345];

        // When the widest number with the same digit count is requested for each
        const widestNumbers = counts.map(NumberUtils.getWidestNumberWithSameDigitCount);

        // Then each one keeps the digit count and is written as 8 followed by 0s
        expect(widestNumbers).toEqual([8, 80, 800]);
    });
});
