import {buildImportedCategoryLookup, normalizeImportedTag} from '@pages/workspace/rules/MerchantRules/ImportedMerchantRulesPage';

import CONST from '@src/CONST';
import type {PolicyCategories} from '@src/types/onyx';

describe('ImportedMerchantRulesPage', () => {
    describe('normalizeImportedTag', () => {
        describe('multi-level tag policy', () => {
            it('collapses the space after the colon in a multi-level tag', () => {
                expect(normalizeImportedTag('Parent: Child', true)).toBe('Parent:Child');
            });

            it('trims surrounding spaces around every level', () => {
                expect(normalizeImportedTag(' Parent : Child : Grandchild ', true)).toBe('Parent:Child:Grandchild');
            });

            it('leaves a single-level tag unchanged', () => {
                expect(normalizeImportedTag('Travel', true)).toBe('Travel');
            });

            it('preserves internal spaces within a level', () => {
                expect(normalizeImportedTag('North America: New York', true)).toBe('North America:New York');
            });

            it('preserves an already canonical multi-level tag', () => {
                expect(normalizeImportedTag('Parent:Child', true)).toBe('Parent:Child');
            });

            it('preserves escaped colons within a single level', () => {
                expect(normalizeImportedTag('Time\\: Tracking', true)).toBe('Time\\: Tracking');
            });

            it('returns an empty string for an empty cell', () => {
                expect(normalizeImportedTag('', true)).toBe('');
            });
        });

        describe('single-level tag policy', () => {
            it('escapes a colon so the cell stays one literal tag name', () => {
                expect(normalizeImportedTag('ab:cd', false)).toBe('ab\\:cd');
            });

            it('preserves internal spaces around a colon in the tag name', () => {
                expect(normalizeImportedTag('ab: cd', false)).toBe('ab\\: cd');
            });

            it('escapes every colon in the tag name', () => {
                expect(normalizeImportedTag('a:b:c', false)).toBe('a\\:b\\:c');
            });

            it('leaves a tag without colons unchanged', () => {
                expect(normalizeImportedTag('Travel', false)).toBe('Travel');
            });

            it('returns an empty string for an empty cell', () => {
                expect(normalizeImportedTag('', false)).toBe('');
            });
        });
    });

    describe('buildImportedCategoryLookup', () => {
        // Policy category names are stored HTML-encoded, so the collection key contains the encoded name
        const encodedFoodAndDrink = 'Food &amp; Drink';
        const policyCategories: PolicyCategories = {
            Travel: {name: 'Travel', enabled: true},
            [encodedFoodAndDrink]: {name: encodedFoodAndDrink, enabled: true},
            Disabled: {name: 'Disabled', enabled: false},
            Deleted: {name: 'Deleted', enabled: true, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        };

        it('resolves an exact category name to its stored name', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('travel')).toBe('Travel');
        });

        it('resolves a cell case-insensitively', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('TRAVEL'.toLowerCase())).toBe('Travel');
        });

        it('resolves a plain-text cell against an HTML-encoded stored name', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('food & drink')).toBe('Food &amp; Drink');
        });

        it('excludes a disabled category', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('disabled')).toBeUndefined();
        });

        it('excludes a category pending deletion', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('deleted')).toBeUndefined();
        });

        it('returns undefined for a category that does not exist on the policy', () => {
            expect(buildImportedCategoryLookup(policyCategories).get('nonexistent')).toBeUndefined();
        });

        it('returns an empty lookup when the policy has no categories', () => {
            expect(buildImportedCategoryLookup(undefined).size).toBe(0);
        });
    });
});
