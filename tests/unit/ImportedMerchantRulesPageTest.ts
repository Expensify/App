import {normalizeImportedTag} from '@pages/workspace/rules/MerchantRules/ImportedMerchantRulesPage';

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
});
