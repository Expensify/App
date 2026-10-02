import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';

import Log from '@libs/Log';
import {getCountryZipRegexDetails} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {DynamicFormField, DynamicFormSchemaField} from '@src/types/onyx';

import {format, subYears} from 'date-fns';

import {translateLocal} from '../../../utils/TestHelper';

describe('getDynamicFieldErrors', () => {
    const warnSpy = jest.spyOn(Log, 'warn').mockImplementation(() => {});

    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    beforeEach(() => {
        warnSpy.mockClear();
    });

    it('accepts an answer that passes every check', () => {
        // Given an account number field with a regex and a length limit
        const accountNumber: DynamicFormField = {key: 'accountNumber', type: 'text', required: true, regex: '^\\d{8}$', minLength: 8, maxLength: 8};

        // When it is answered with eight digits
        const errors = getDynamicFieldErrors([accountNumber], {accountNumber: '12345678'}, translateLocal);

        // Then there are no errors
        expect(errors).toEqual({});
    });

    it('flags a missing required answer and skips an empty optional one', () => {
        // Given a blank required field with a regex and an empty optional one
        const accountNumber: DynamicFormField = {key: 'accountNumber', type: 'text', required: true, regex: '^\\d{8}$'};
        const yearsInBusiness: DynamicFormField = {key: 'yearsInBusiness', type: 'number', required: false};

        // When the form is validated
        const errors = getDynamicFieldErrors([accountNumber, yearsInBusiness], {accountNumber: ' ', yearsInBusiness: ''}, translateLocal);

        // Then only the required field is flagged, and its regex does not run on the blank answer
        expect(errors).toEqual({accountNumber: translateLocal('common.error.fieldRequired')});
    });

    it('treats an unchecked checkbox as unanswered', () => {
        // Given a required consent checkbox left unchecked, next to another question
        const acceptTerms: DynamicFormField = {key: 'acceptTerms', type: 'boolean', required: true};
        const companyName: DynamicFormField = {key: 'companyName', type: 'text', required: false};

        // When the form is validated
        const errors = getDynamicFieldErrors([acceptTerms, companyName], {acceptTerms: false}, translateLocal);

        // Then it is flagged as required, because consent must be given
        expect(errors).toEqual({acceptTerms: translateLocal('common.error.fieldRequired')});
    });

    it('reports every failed format check of a text answer', () => {
        // Given a field with a regex, a minimum length and an example
        const accountNumber: DynamicFormField = {key: 'accountNumber', type: 'text', required: true, regex: '^\\d{8}$', minLength: 8, example: '12345678'};

        // When it is answered with an answer that breaks both
        const errors = getDynamicFieldErrors([accountNumber], {accountNumber: '12ab'}, translateLocal);

        // Then both messages are shown, so the user can fix the answer in one go
        expect(errors.accountNumber).toBe(`${translateLocal('dynamicForm.error.invalidFormat', {example: '12345678'})}\n${translateLocal('dynamicForm.error.tooShort', {minLength: 8})}`);
    });

    it('rejects characters a legal name cannot contain', () => {
        // Given a legal name field and a name with a semicolon
        const legalName: DynamicFormField = {
            key: 'legalName',
            type: 'text',
            required: true,
            rule: 'legalName',
        };

        // When the form is validated
        const errors = getDynamicFieldErrors([legalName], {legalName: 'Jane; Doe'}, translateLocal);

        // Then the name is rejected
        expect(errors).toEqual({
            legalName: translateLocal('privatePersonalDetails.error.hasInvalidCharacter'),
        });
    });

    it('rejects a number answer that is not a finite number', () => {
        // Given a number field answered with text
        const yearsInBusiness: DynamicFormField = {key: 'yearsInBusiness', type: 'number', required: false};

        // When the form is validated
        const errors = getDynamicFieldErrors([yearsInBusiness], {yearsInBusiness: 'ten'}, translateLocal);

        // Then the answer is flagged as the wrong format
        expect(errors).toEqual({
            yearsInBusiness: translateLocal('dynamicForm.error.invalidFormat', {
                example: undefined,
            }),
        });
    });

    it('rejects a choice the options no longer offer', () => {
        // Given an account type whose options depend on the recipient type, where savings is offered only to private recipients
        const accountType: DynamicFormField = {
            key: 'accountType',
            type: 'select',
            required: true,
            dependsOn: {key: 'legalType', valuesBy: {PRIVATE: [{key: 'SAVINGS'}], BUSINESS: [{key: 'CHECKING'}]}},
        };

        // When savings stays picked after the recipient switches to business
        const errors = getDynamicFieldErrors([accountType], {legalType: 'BUSINESS', accountType: 'SAVINGS'}, translateLocal);

        // Then the stale choice is flagged
        expect(errors).toEqual({accountType: translateLocal('dynamicForm.error.invalidOption')});
    });

    it('applies the date of birth age limits', () => {
        // Given a date of birth field answered with a date that makes the person 10 years old
        const dateOfBirth: DynamicFormField = {key: 'dateOfBirth', type: 'date', required: true, rule: 'dateOfBirth'};
        const tenYearsAgo = format(subYears(new Date(), 10), CONST.DATE.FNS_FORMAT_STRING);

        // When the form is validated
        const errors = getDynamicFieldErrors([dateOfBirth], {dateOfBirth: tenYearsAgo}, translateLocal);

        // Then the minimum age error is shown
        expect(errors).toEqual({
            dateOfBirth: translateLocal('bankAccount.error.age'),
        });
    });

    it('checks the zip code against the chosen country', () => {
        // Given an optional address field with the zip code rule, answered with a UK address and a US zip code
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: false, rule: 'zipCode'};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const values = {
            homeAddress: '1 High Street',
            [addressKeys.zipCode]: '10001',
            [addressKeys.country]: 'GB',
        };

        // When the form is validated
        const errors = getDynamicFieldErrors([homeAddress], values, translateLocal);

        // Then the zip code input is flagged with the UK format
        expect(errors).toEqual({
            [addressKeys.zipCode]: translateLocal('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails(CONST.COUNTRY.GB)?.samples),
        });
    });

    it('skips hidden and readonly fields', () => {
        // Given a required field hidden by showWhen and a required readonly field, both unanswered
        const hidden: DynamicFormField = {
            key: 'companyName',
            type: 'text',
            required: true,
            showWhen: {key: 'legalType', equals: ['BUSINESS']},
        };
        const readonly: DynamicFormField = {
            key: 'accountHolder',
            type: 'text',
            required: true,
            readonly: true,
        };

        // When the form is validated for a private recipient
        const errors = getDynamicFieldErrors([hidden, readonly], {legalType: 'PRIVATE'}, translateLocal);

        // Then neither blocks submission, because the user cannot answer them
        expect(errors).toEqual({});
    });

    it('drops a field of an unknown type instead of blocking submission', () => {
        // Given a required field whose type this App version does not know, as a newer server could send
        const signature: DynamicFormSchemaField = {key: 'signature', type: 'signature', required: true};

        // When the form is validated twice
        getDynamicFieldErrors([signature], {}, translateLocal);
        const errors = getDynamicFieldErrors([signature], {}, translateLocal);

        // Then it has no error, and the unknown type is logged once rather than on every validation
        expect(errors).toEqual({});
        expect(warnSpy).toHaveBeenCalledTimes(1);
        expect(warnSpy).toHaveBeenCalledWith('[DynamicForm] Unknown field type', {
            type: 'signature',
            key: 'signature',
        });
    });

    it('accepts any answer when the schema regex is broken', () => {
        // Given a field whose regex does not compile
        const broken: DynamicFormField = {
            key: 'reference',
            type: 'text',
            required: true,
            regex: '(unclosed',
        };

        // When the form is validated
        const errors = getDynamicFieldErrors([broken], {reference: 'anything'}, translateLocal);

        // Then the user is not blocked by a schema mistake, and the mistake is logged
        expect(errors).toEqual({});
        expect(warnSpy).toHaveBeenCalledWith('[DynamicForm] Invalid regex', {
            key: 'reference',
            regex: '(unclosed',
        });
    });

    it('treats a multiselect as unanswered when it holds no option still offered', () => {
        // Given a required multiselect whose options depend on the business type
        const industries: DynamicFormField = {
            key: 'industries',
            type: 'multiselect',
            required: true,
            dependsOn: {key: 'businessType', valuesBy: {RETAIL: [{key: 'CLOTHING'}], SERVICES: [{key: 'CONSULTING'}]}},
        };

        // When it is left empty, when it keeps only a retail choice after the business type changed to services, and when it also has a services choice
        const emptyErrors = getDynamicFieldErrors([industries], {businessType: 'RETAIL', industries: []}, translateLocal);
        const staleErrors = getDynamicFieldErrors([industries], {businessType: 'SERVICES', industries: ['CLOTHING']}, translateLocal);
        const mixedErrors = getDynamicFieldErrors([industries], {businessType: 'SERVICES', industries: ['CLOTHING', 'CONSULTING']}, translateLocal);

        // Then the list inputs show no stale choice the user could clear, so a list of only stale choices is flagged as required, like an empty one
        expect(emptyErrors).toEqual({industries: translateLocal('common.error.fieldRequired')});
        expect(staleErrors).toEqual({industries: translateLocal('common.error.fieldRequired')});
        expect(mixedErrors).toEqual({});
    });

    it('flags each missing part of a required address on its own input', () => {
        // Given a required address with only the street filled in
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);

        // When the form is validated
        const errors = getDynamicFieldErrors([homeAddress], {homeAddress: '1 High Street'}, translateLocal);

        // Then city, state, zip and country are each flagged, so every empty input shows its own error
        const required = translateLocal('common.error.fieldRequired');
        expect(errors).toEqual({[addressKeys.city]: required, [addressKeys.state]: required, [addressKeys.zipCode]: required, [addressKeys.country]: required});
    });

    it('requires the state only in countries the state picker covers', () => {
        // Given a required UK address with every part but the state
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const values = {homeAddress: '1 High Street', [addressKeys.city]: 'London', [addressKeys.zipCode]: 'SW1A 1AA', [addressKeys.country]: 'GB'};

        // When the form is validated
        const errors = getDynamicFieldErrors([homeAddress], values, translateLocal);

        // Then nothing is flagged, since the picker only lists US states and Canadian provinces
        expect(errors).toEqual({});
    });

    it('accepts US and international phone numbers and rejects incomplete ones', () => {
        // Given a phone field
        const phone: DynamicFormField = {key: 'phone', type: 'text', required: true, rule: 'phone'};

        // When it is answered with a US number, a UK number and an incomplete number
        const usErrors = getDynamicFieldErrors([phone], {phone: '+1 415 555 0132'}, translateLocal);
        const ukErrors = getDynamicFieldErrors([phone], {phone: '+44 20 7946 0958'}, translateLocal);
        const incompleteErrors = getDynamicFieldErrors([phone], {phone: '+1 415'}, translateLocal);

        // Then only the incomplete number is flagged
        expect(usErrors).toEqual({});
        expect(ukErrors).toEqual({});
        expect(incompleteErrors).toEqual({phone: translateLocal('common.error.phoneNumber')});
    });

    it('accepts No as the answer to a Yes/No question, but not as consent', () => {
        // Given a required Yes/No question and a required consent checkbox, each alone on its page
        const hasOtherOwners: DynamicFormField = {key: 'hasOtherOwners', type: 'boolean', required: true, presentation: 'yesNo'};
        const acceptTerms: DynamicFormField = {key: 'acceptTerms', type: 'boolean', required: true};

        // When the question is answered No or not at all, and the checkbox is left empty
        const noErrors = getDynamicFieldErrors([hasOtherOwners], {hasOtherOwners: false}, translateLocal);
        const unansweredErrors = getDynamicFieldErrors([hasOtherOwners], {hasOtherOwners: ''}, translateLocal);
        const consentErrors = getDynamicFieldErrors([acceptTerms], {acceptTerms: false}, translateLocal);

        // Then No answers the question, while an unanswered question and an empty checkbox are flagged, since every checkbox must be ticked
        expect(noErrors).toEqual({});
        expect(unansweredErrors).toEqual({hasOtherOwners: translateLocal('common.error.fieldRequired')});
        expect(consentErrors).toEqual({acceptTerms: translateLocal('common.error.fieldRequired')});
    });

    it('checks a list for its size and for the first entry with a problem', () => {
        // Given a list of at least two directors, whose entries need a first name and may hold a sensitive SSN
        const directors: DynamicFormField = {
            key: 'directors',
            type: 'list',
            required: true,
            minItems: 2,
            itemFields: [
                {key: 'firstName', type: 'text', required: true},
                {key: 'ssn', type: 'text', required: true, sensitive: true},
            ],
        };

        // When it holds no entry, and when it holds one entry without a first name
        const emptyErrors = getDynamicFieldErrors([directors], {directors: []}, translateLocal);
        const shortErrors = getDynamicFieldErrors([directors], {directors: [{id: 'jane', answers: {firstName: ''}}]}, translateLocal);

        // Then the empty list is required, and the short list shows both the size and the entry's missing name, while the SSN kept outside the entry is not checked
        expect(emptyErrors).toEqual({directors: translateLocal('common.error.fieldRequired')});
        expect(shortErrors).toEqual({directors: `${translateLocal('dynamicForm.error.tooFewItems', {min: 2})}\n${translateLocal('common.error.fieldRequired')}`});
    });

    it('skips a field whose controlling field is hidden on another page', () => {
        // Given a proof upload revealed by a source of funds, which is only asked for risky industries, each on its own page
        const industry: DynamicFormField = {key: 'industry', type: 'select', required: true, values: [{key: 'SAFE'}, {key: 'RISKY'}]};
        const sourceOfFunds: DynamicFormField = {key: 'sourceOfFunds', type: 'select', required: true, showWhen: {key: 'industry', equals: ['RISKY']}};
        const proof: DynamicFormField = {key: 'proof', type: 'file', required: true, showWhen: {key: 'sourceOfFunds', equals: ['SALARY']}};

        // When the proof page is validated for a safe industry, with a source of funds left from an earlier risky answer
        const errors = getDynamicFieldErrors([proof], {industry: 'SAFE', sourceOfFunds: 'SALARY'}, translateLocal, [industry, sourceOfFunds, proof]);

        // Then the proof is not required, since it is not asked
        expect(errors).toEqual({});
    });
});
