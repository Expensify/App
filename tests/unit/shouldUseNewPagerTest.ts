import shouldUseNewPager from '@libs/shouldUseNewPager';

describe('shouldUseNewPager', () => {
    it('should return false on all platforms', () => {
        const result = shouldUseNewPager();

        expect(result).toBe(false);
    });

    it('should consistently return false across multiple calls', () => {
        const result1 = shouldUseNewPager();
        const result2 = shouldUseNewPager();
        const result3 = shouldUseNewPager();

        expect(result1).toBe(false);
        expect(result2).toBe(false);
        expect(result3).toBe(false);
        expect(result1).toBe(result2);
        expect(result2).toBe(result3);
    });
});
