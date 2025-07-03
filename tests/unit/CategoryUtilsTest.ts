import {isCategoryMissing} from '@libs/CategoryUtils';

describe(`isMissingCategory`, () => {
    it('returns true if category is undefined', () => {
        expect(isCategoryMissing(undefined)).toBe(true);
    });

    it('returns true if category is an empty string', () => {
        expect(isCategoryMissing('')).toBe(true);
    });

    it('returns true if category "none" or "Uncategorized"', () => {
        expect(isCategoryMissing('none')).toBe(true);
        expect(isCategoryMissing('Uncategorized')).toBe(true);
    });

    it('returns false if category is a valid string', () => {
        expect(isCategoryMissing('Travel')).toBe(false);
        expect(isCategoryMissing('Meals')).toBe(false);
    });
});
