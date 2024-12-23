import {validateTaxClaimableValue} from '@libs/PolicyDistanceRatesUtils';

describe('PolicyDistanceRatesUtils', () => {
    describe('validateTaxClaimableValue', () => {
        it('should return false when taxClaimableValue is equal to rate', () => {
            // Given a tax claimable value inserted for a distance rate
            // When the taxClaimableValue is equal to the distance rate
            const validate = validateTaxClaimableValue({taxClaimableValue: '0.67'}, {rate: 67});
            // Then validateTaxClaimableValue will return an error.
            expect(validate.taxClaimableValue).toBeDefined();
        });
    });
});
