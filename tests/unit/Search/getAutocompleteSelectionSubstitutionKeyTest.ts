import getAutocompleteSelectionSubstitutionKey from '@src/components/Search/SearchRouter/getAutocompleteSelectionSubstitutionKey';

describe('getAutocompleteSelectionSubstitutionKey', () => {
    it('returns fallback map key for first occurrence of a value', () => {
        const key = getAutocompleteSelectionSubstitutionKey('workspace:"Alpha" ', 'policyID', 'policyID:Alpha', 'Alpha');
        expect(key).toBe('policyID:Alpha');
    });

    it('returns indexed key for duplicate occurrences of same value', () => {
        const key = getAutocompleteSelectionSubstitutionKey('workspace:"Alpha","Alpha" ', 'policyID', 'policyID:Alpha', 'Alpha');
        expect(key).toBe('policyID:Alpha:1');
    });

    it('counts index per key+value and does not index first occurrence of different value', () => {
        const key = getAutocompleteSelectionSubstitutionKey('workspace:"Alpha","Beta" ', 'policyID', 'policyID:Beta', 'Beta');
        expect(key).toBe('policyID:Beta');
    });
});
