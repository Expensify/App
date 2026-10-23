import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';

import getPageWithServerError from '@pages/settings/Wallet/EnableGlobalReimbursements/Wise/getPageWithServerError';

const ERROR_KEY = 1;
const ADDRESS_KEYS = getAddressInputKeys('address');

describe('getPageWithServerError', () => {
    it.each([
        ['the street, which uses the address field key', ADDRESS_KEYS.street, 'representative'],
        ['an address part', ADDRESS_KEYS.zipCode, 'representative'],
        ['a business answer', 'description', 'business'],
    ])('finds the page for an error on %s', (_label, errorKey, expectedPageKey) => {
        // Given a server error under a key a page collects
        const errorFields = {[errorKey]: {[ERROR_KEY]: 'Invalid'}};

        // When the page holding the error is looked up
        const page = getPageWithServerError(errorFields);

        // Then it is the page the user can fix the answer on
        expect(page?.key).toBe(expectedPageKey);
    });

    it.each([
        ['a key no page collects', 'registrationNumber'],
        ['the read-only legal name, which the user cannot change', 'companyName'],
        ['the street under its JSON path, which no input uses', 'address.street'],
    ])('finds no page for an error on %s', (_label, errorKey) => {
        // Given a server error the onboarding pages cannot show under an editable field
        const errorFields = {[errorKey]: {[ERROR_KEY]: 'Invalid'}};

        // When the page holding the error is looked up
        const page = getPageWithServerError(errorFields);

        // Then there is none, so the caller shows the error where the request was made
        expect(page).toBeUndefined();
    });

    it('ignores a field whose errors were cleared', () => {
        // Given a key left as an empty object once its errors were merged away
        const errorFields = {description: {}};

        // When the page holding the error is looked up
        // Then there is none, since nothing is left to fix
        expect(getPageWithServerError(errorFields)).toBeUndefined();
    });
});
