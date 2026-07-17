import {normalizeImportedTag} from '@pages/workspace/rules/MerchantRules/ImportedMerchantRulesPage';

describe('ImportedMerchantRulesPage', () => {
    describe('normalizeImportedTag', () => {
        it('collapses the space after the colon in a multi-level tag', () => {
            // "Parent: Child" was previously stored verbatim and split into ["Parent", " Child"] on display
            expect(normalizeImportedTag('Parent: Child')).toBe('Parent:Child');
        });

        it('trims surrounding spaces around every level', () => {
            expect(normalizeImportedTag(' Parent : Child : Grandchild ')).toBe('Parent:Child:Grandchild');
        });

        it('leaves a single-level tag unchanged', () => {
            expect(normalizeImportedTag('Travel')).toBe('Travel');
        });

        it('preserves internal spaces within a level', () => {
            expect(normalizeImportedTag('North America: New York')).toBe('North America:New York');
        });

        it('preserves an already canonical multi-level tag', () => {
            expect(normalizeImportedTag('Parent:Child')).toBe('Parent:Child');
        });

        it('preserves escaped colons within a single level', () => {
            expect(normalizeImportedTag('Time\\: Tracking')).toBe('Time\\: Tracking');
        });

        it('returns an empty string for an empty cell', () => {
            expect(normalizeImportedTag('')).toBe('');
        });
    });
});
