import sortBankInformationFields from '@pages/ReimbursementAccount/NonUSD/utils/sortBankInformationFields';

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

describe('sortBankInformationFields', () => {
    it('puts Bank address before Bank city when the API returns the city first', () => {
        // Given the API returns bankCity before bankAddressLine1, as it does for Croatia/EUR
        const fields = [createField('bankName'), createField('bankCity'), createField('bankAddressLine1')];

        // When the fields are sorted
        const sortedFields = sortBankInformationFields(fields);

        // Then Bank address comes first, so picking an address can't overwrite a city the user already typed
        expect(getIDs(sortedFields)).toEqual(['bankName', 'bankAddressLine1', 'bankCity']);
    });

    it('keeps the fields that are not bank information fields in their original slots', () => {
        // Given bank information fields mixed with account fields like IBAN and SWIFT
        const fields = [createField('accountNumber'), createField('bankPostal'), createField('swiftBicCode'), createField('bankCity'), createField('bankAddressLine1'), createField('IBAN')];

        // When the fields are sorted
        const sortedFields = sortBankInformationFields(fields);

        // Then only the bank information fields are reordered, inside the slots they already held
        expect(getIDs(sortedFields)).toEqual(['accountNumber', 'bankAddressLine1', 'swiftBicCode', 'bankCity', 'bankPostal', 'IBAN']);
    });

    it('returns the same order when the fields are already sorted', () => {
        // Given fields that already follow the expected order
        const fields = [createField('bankName'), createField('bankAddressLine1'), createField('bankCity'), createField('accountNumber')];

        // When the fields are sorted
        const sortedFields = sortBankInformationFields(fields);

        // Then nothing moves
        expect(getIDs(sortedFields)).toEqual(['bankName', 'bankAddressLine1', 'bankCity', 'accountNumber']);
    });

    it('does not mutate the original array', () => {
        // Given fields in the wrong order
        const fields = [createField('bankCity'), createField('bankAddressLine1')];

        // When the fields are sorted
        sortBankInformationFields(fields);

        // Then the input array is left untouched, since it comes straight from Onyx
        expect(getIDs(fields)).toEqual(['bankCity', 'bankAddressLine1']);
    });

    it('returns an empty array when there are no fields', () => {
        // Given no fields
        // When the fields are sorted
        // Then an empty array is returned
        expect(sortBankInformationFields([])).toEqual([]);
    });
});
