import hasFormChanges from '@libs/hasFormChanges';

describe('hasFormChanges', () => {
    it.each([undefined, null, {}, {name: 'Jane'}, {name: ' Jane '}, {metadata: true}])('ignores absent, unchanged, reverted and metadata-only drafts: %p', (values) => {
        // Given a saved editable field with unrelated metadata excluded
        const baseline = {name: 'Jane'};
        // When its partial draft is compared
        const dirty = hasFormChanges(values, baseline);
        // Then an unchanged field does not warn
        expect(dirty).toBe(false);
    });

    it.each([{name: 'Janet'}, {name: ''}])('detects changed and explicitly cleared input: %p', (values) => {
        // Given a saved non-empty field
        const baseline = {name: 'Jane'};
        // When it is changed or deleted
        const dirty = hasFormChanges(values, baseline);
        // Then deletion differs from an absent partial-draft field
        expect(dirty).toBe(true);
    });

    it('compares equivalent US states and postal codes without normalizing foreign free-text states', () => {
        // Given initialized address values using a full US state name
        const baseline = {country: 'US', state: 'California', zipPostCode: 'ABC'};
        // When equivalent normalized values are compared
        const dirty = hasFormChanges({state: 'CA', zipPostCode: 'abc'}, baseline);
        // Then formatting alone is clean, but distinct foreign state text remains dirty
        expect(dirty).toBe(false);
        expect(hasFormChanges({state: 'CA'}, {country: 'GB', state: 'California'})).toBe(true);
    });
});
