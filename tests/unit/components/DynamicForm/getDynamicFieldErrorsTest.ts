import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';

import Log from '@libs/Log';
import {getCountryZipRegexDetails} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {DynamicFormField} from '@src/types/onyx';

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
        // Given a required consent checkbox left unchecked
        const acceptTerms: DynamicFormField = {key: 'acceptTerms', type: 'boolean', required: true};

        // When the form is validated
        const errors = getDynamicFieldErrors([acceptTerms], {acceptTerms: false}, translateLocal);

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
        // Given an address field with the zip code rule, answered with a UK address and a US zip code
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true, rule: 'zipCode'};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const values = {
            homeAddress: '1 High Street',
            [addressKeys.zipCode]: '10001',
            [addressKeys.country]: 'GB',
        };

        // When the form is validated
        const errors = getDynamicFieldErrors([homeAddress], values, translateLocal);

        // Then the zip code is flagged with the UK format
        expect(errors).toEqual({
            homeAddress: translateLocal('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails(CONST.COUNTRY.GB)?.samples),
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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- stands in for a server type the App does not know
        const signature = {
            key: 'signature',
            type: 'signature',
            required: true,
        } as unknown as DynamicFormField;

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
});
