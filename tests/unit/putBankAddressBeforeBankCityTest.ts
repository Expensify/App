import putBankAddressBeforeBankCity from '@pages/ReimbursementAccount/NonUSD/utils/putBankAddressBeforeBankCity';

import type {CorpayFormField} from '@src/types/onyx';

function createField(id: string): CorpayFormField {
    return {
        id,
        label: id,
        errorMessage: '',
        isRequired: true,
        isRequiredInValueSet: false,
        regEx: '',
        validationRules: [],
    };
}

function getIDs(fields: CorpayFormField[]): string[] {
    return fields.map((field) => field.id);
}

describe('putBankAddressBeforeBankCity', () => {
    it('puts Bank address before Bank city when the API returns the city first', () => {
        // Given the API returns bankCity before bankAddressLine1, as it does for Croatia/EUR
        const fields = [createField('bankName'), createField('bankCity'), createField('bankAddressLine1')];

        // When the fields are reordered
        const reorderedFields = putBankAddressBeforeBankCity(fields);

        // Then Bank address comes first, so picking an address can't overwrite a city the user already typed
        expect(getIDs(reorderedFields)).toEqual(['bankName', 'bankAddressLine1', 'bankCity']);
    });

    it('only swaps Bank address and Bank city and leaves every other field where it was', () => {
        // Given Bank city and Bank address mixed with other fields like IBAN, SWIFT and Bank postal
        const fields = [createField('accountNumber'), createField('bankPostal'), createField('swiftBicCode'), createField('bankCity'), createField('bankAddressLine1'), createField('IBAN')];

        // When the fields are reordered
        const reorderedFields = putBankAddressBeforeBankCity(fields);

        // Then only Bank city and Bank address trade places
        expect(getIDs(reorderedFields)).toEqual(['accountNumber', 'bankPostal', 'swiftBicCode', 'bankAddressLine1', 'bankCity', 'IBAN']);
    });

    it('swaps Bank address and Bank city when other fields sit between them', () => {
        // Given Bank city and Bank address are not next to each other
        const fields = [createField('bankCity'), createField('bankPostal'), createField('bankAddressLine1')];

        // When the fields are reordered
        const reorderedFields = putBankAddressBeforeBankCity(fields);

        // Then the two swap slots and the field between them stays put
        expect(getIDs(reorderedFields)).toEqual(['bankAddressLine1', 'bankPostal', 'bankCity']);
    });

    it('returns the same order when Bank address already comes before Bank city', () => {
        // Given fields that already have Bank address before Bank city
        const fields = [createField('bankName'), createField('bankAddressLine1'), createField('bankCity'), createField('accountNumber')];

        // When the fields are reordered
        const reorderedFields = putBankAddressBeforeBankCity(fields);

        // Then nothing moves
        expect(getIDs(reorderedFields)).toEqual(['bankName', 'bankAddressLine1', 'bankCity', 'accountNumber']);
    });

    it('returns the same order when only one of the two fields is present', () => {
        // Given fields with Bank city but no Bank address
        const fields = [createField('bankName'), createField('bankCity'), createField('bankPostal')];

        // When the fields are reordered
        const reorderedFields = putBankAddressBeforeBankCity(fields);

        // Then nothing moves
        expect(getIDs(reorderedFields)).toEqual(['bankName', 'bankCity', 'bankPostal']);
    });

    it('does not mutate the original array', () => {
        // Given fields in the wrong order
        const fields = [createField('bankCity'), createField('bankAddressLine1')];

        // When the fields are reordered
        putBankAddressBeforeBankCity(fields);

        // Then the input array is left untouched, since it comes straight from Onyx
        expect(getIDs(fields)).toEqual(['bankCity', 'bankAddressLine1']);
    });

    it('returns an empty array when there are no fields', () => {
        // Given no fields
        // When the fields are reordered
        // Then an empty array is returned
        expect(putBankAddressBeforeBankCity([])).toEqual([]);
    });
});
