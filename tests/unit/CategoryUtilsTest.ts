import {isCategoryDescriptionRequired, isCategoryMissing} from '@libs/CategoryUtils';
import type {PolicyCategories} from '@src/types/onyx';

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

describe('isCategoryDescriptionRequired', () => {
    const mockPolicyCategories: PolicyCategories = {
        Travel: {
            areCommentsRequired: true,
            enabled: true,
            name: 'Travel',
            pendingAction: null,
        },
        Meals: {
            areCommentsRequired: false,
            enabled: true,
            name: 'Meals',
            pendingAction: null,
        },
        Office: {
            areCommentsRequired: true,
            enabled: false,
            name: 'Office',
            pendingAction: null,
        },
    };

    it('returns false when policyCategories is undefined', () => {
        expect(isCategoryDescriptionRequired(undefined, 'Travel', true)).toBe(false);
    });

    it('returns false when category is undefined', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, undefined, true)).toBe(false);
    });

    it('returns false when category is empty string', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, '', true)).toBe(false);
    });

    it('returns false when areRulesEnabled is undefined', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Travel', undefined)).toBe(false);
    });

    it('returns false when areRulesEnabled is false', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Travel', false)).toBe(false);
    });

    it('returns true when category has areCommentsRequired set to true and rules are enabled', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Travel', true)).toBe(true);
    });

    it('returns false when category has areCommentsRequired set to false even if rules are enabled', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Meals', true)).toBe(false);
    });

    it('returns true when category has areCommentsRequired set to true regardless of enabled status', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'Office', true)).toBe(true);
    });

    it('returns false when category does not exist in policyCategories', () => {
        expect(isCategoryDescriptionRequired(mockPolicyCategories, 'NonExistentCategory', true)).toBe(false);
    });

    it('returns false when all parameters are valid but areCommentsRequired is falsy', () => {
        const categoriesWithFalsyComments: PolicyCategories = {
            TestCategory: {
                areCommentsRequired: false,
                enabled: true,
                name: 'TestCategory',
                pendingAction: null,
            },
        };
        expect(isCategoryDescriptionRequired(categoriesWithFalsyComments, 'TestCategory', true)).toBe(false);
    });

    it('handles edge case with undefined areCommentsRequired', () => {
        const categoriesWithUndefinedComments: PolicyCategories = {
            TestCategory: {
                enabled: true,
                name: 'TestCategory',
                pendingAction: null,
            },
        };
        expect(isCategoryDescriptionRequired(categoriesWithUndefinedComments, 'TestCategory', true)).toBe(false);
    });
});
