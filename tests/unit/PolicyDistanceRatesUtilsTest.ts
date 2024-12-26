import {validateTaxClaimableValue} from '@libs/PolicyDistanceRatesUtils';

describe('PolicyDistanceRatesUtils', () => {
    describe('validateTaxClaimableValue', () => {
        it('should return an error when taxClaimableValue is equal to tax rate', () => {
            // Given a tax claimable value inserted for a distance rate
            // When the taxClaimableValue is equal to the tax rate
            const validate = validateTaxClaimableValue({taxClaimableValue: '0.67'}, {rate: 67, customUnitRateID: ''});
            // Then validateTaxClaimableValue will return an error.
            expect(validate.taxClaimableValue).toBeDefined();
        });
    });
});
