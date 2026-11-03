import {getMerchantToMatchLengthError} from '@pages/workspace/rules/MerchantRules/AddMerchantToMatchPage';

import CONST from '@src/CONST';

describe('Merchant to match validation', () => {
    it('accepts an empty merchant, which clears the condition', () => {
        // Given an expense default rule that matches on something other than a merchant, such as a category
        // When the admin clears the merchant to stop matching on it
        // Then there is no error, where a merchant used to be required of every rule
        expect(getMerchantToMatchLengthError('')).toBeUndefined();
    });

    it('accepts a merchant of only whitespace the same way as an empty one', () => {
        // Given a field holding nothing but spaces
        // When it is validated
        // Then it clears the condition rather than being stored as a merchant made of spaces
        expect(getMerchantToMatchLengthError('   ')).toBeUndefined();
    });

    it('accepts a merchant within the length the backend stores', () => {
        // Given an ordinary merchant name
        // When it is validated
        // Then it is storable
        expect(getMerchantToMatchLengthError('Starbucks')).toBeUndefined();
    });

    it('reports the length of a merchant too long to store', () => {
        // Given a merchant one byte over the limit
        const tooLong = 'a'.repeat(CONST.MERCHANT_NAME_MAX_BYTES + 1);

        // When it is validated
        // Then its byte length comes back, which the page shows in the limit message
        expect(getMerchantToMatchLengthError(tooLong)).toBe(CONST.MERCHANT_NAME_MAX_BYTES + 1);
    });
});
