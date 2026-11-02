import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getDynamicFieldErrors from '@components/DynamicForm/utils/getDynamicFieldErrors';
import {getListItemSensitiveKey} from '@components/DynamicForm/utils/listItems';

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
        const acceptTerms: DynamicFormField = {key: 'acceptTerms', type: 'boolean', required: true, presentation: 'checkbox'};
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

    it('rejects a comma or semicolon in a legal name, as the profile legal name page does', () => {
        // Given a legal name field and a name with a semicolon
        const legalName: DynamicFormField = {key: 'legalName', type: 'text', required: true, rule: 'legalName'};

        // When the form is validated
        const errors = getDynamicFieldErrors([legalName], {legalName: 'Jane; Doe'}, translateLocal);

        // Then the name is rejected with the profile page's message
        expect(errors).toEqual({
            legalName: translateLocal('privatePersonalDetails.error.cannotIncludeCommaOrSemicolon'),
        });
    });

    it('accepts a legal name written in a non-Latin script, as the profile legal name page does', () => {
        // Given a legal name field and a name in Cyrillic
        const legalName: DynamicFormField = {key: 'legalName', type: 'text', required: true, rule: 'legalName'};

        // When the form is validated
        // cspell:disable-next-line
        const errors = getDynamicFieldErrors([legalName], {legalName: 'Євгеній'}, translateLocal);

        // Then the name is accepted, so the same name works here and on the profile
        expect(errors).toEqual({});
    });

    it('caps a legal name at the length the profile legal name allows', () => {
        // Given a legal name field and a name one character over the profile legal name's limit
        const legalName: DynamicFormField = {key: 'legalName', type: 'text', required: true, rule: 'legalName'};
        const name = 'A'.repeat(CONST.LEGAL_NAME.MAX_LENGTH + 1);

        // When the form is validated
        const errors = getDynamicFieldErrors([legalName], {legalName: name}, translateLocal);

        // Then the name is rejected with the character count, as on the profile legal name page
        expect(errors).toEqual({
            legalName: translateLocal('common.error.characterLimitExceedCounter', name.length, CONST.LEGAL_NAME.MAX_LENGTH),
        });
    });

    it('rejects a legal name containing a reserved word, as the profile legal name page does', () => {
        // Given a legal name field and a name that uses a reserved name
        const legalName: DynamicFormField = {key: 'legalName', type: 'text', required: true, rule: 'legalName'};
        const name = `Jane ${CONST.DISPLAY_NAME.RESERVED_NAMES.at(0)}`;

        // When the form is validated
        const errors = getDynamicFieldErrors([legalName], {legalName: name}, translateLocal);

        // Then the name is rejected, since it could pass for an Expensify account
        expect(errors).toEqual({
            legalName: translateLocal('personalDetails.error.containsReservedWord'),
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

    it('flags a zip of only spaces as missing, not as a wrong format', () => {
        // Given a required address with the zip code rule, in Great Britain, whose zip holds only spaces
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true, rule: 'zipCode'};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const values = {homeAddress: '1 High Street', [addressKeys.city]: 'London', [addressKeys.country]: 'GB', [addressKeys.zipCode]: '   '};

        // When the form is validated
        const errors = getDynamicFieldErrors([homeAddress], values, translateLocal);

        // Then the zip input gets the required error alone, since a format error on an empty zip would only add noise
        expect(errors).toEqual({[addressKeys.zipCode]: translateLocal('common.error.fieldRequired')});
    });

    it('checks the zip code against the chosen country', () => {
        // Given an optional address field with the zip code rule, answered with a UK address and a US zip code
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: false, rule: 'zipCode'};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const values = {
            homeAddress: '1 High Street',
            [addressKeys.city]: 'London',
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

    it('drops a field without a key instead of storing its answer under an empty draft key', () => {
        // Given a required address whose key is empty, as a broken server schema could send
        const homeAddress: DynamicFormSchemaField = {key: '', type: 'address', required: true};

        // When the form is validated
        const errors = getDynamicFieldErrors([homeAddress], {}, translateLocal);

        // Then it has no error, and the missing key is logged so the schema can be fixed
        expect(errors).toEqual({});
        expect(warnSpy).toHaveBeenCalledWith('[DynamicForm] Field without a key', {type: 'address'});
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

    it('accepts a percent from 1 to 100', () => {
        // Given an ownership percentage
        const ownership: DynamicFormField = {key: 'ownership', type: 'percent', required: true};

        // When it is 0, 1, 100, 101 and a word
        const errorsByAnswer = ['0', '1', '100', '101', 'abc'].map((answer) => getDynamicFieldErrors([ownership], {ownership: answer}, translateLocal));

        // Then only 1 and 100 pass, since an owner with no share, more than the whole company or no number at all is a typo
        const outOfRange = {ownership: translateLocal('dynamicForm.error.outOfRange', {min: 1, max: 100})};
        expect(errorsByAnswer).toEqual([outOfRange, {}, {}, outOfRange, outOfRange]);
    });

    it('flags a multiselect choice the current options do not offer', () => {
        // Given a required multiselect whose options depend on the business type
        const industries: DynamicFormField = {
            key: 'industries',
            type: 'multiselect',
            required: true,
            dependsOn: {key: 'businessType', valuesBy: {RETAIL: [{key: 'CLOTHING'}], SERVICES: [{key: 'CONSULTING'}]}},
        };

        // When it is left empty, when it keeps a retail choice after the business type changed to services, and when it holds only a services choice
        const emptyErrors = getDynamicFieldErrors([industries], {businessType: 'RETAIL', industries: []}, translateLocal);
        const staleErrors = getDynamicFieldErrors([industries], {businessType: 'SERVICES', industries: ['CLOTHING', 'CONSULTING']}, translateLocal);
        const validErrors = getDynamicFieldErrors([industries], {businessType: 'SERVICES', industries: ['CONSULTING']}, translateLocal);

        // Then an empty list is required, a stale choice asks the user to pick from the available options, and a valid list passes
        expect(emptyErrors).toEqual({industries: translateLocal('common.error.fieldRequired')});
        expect(staleErrors).toEqual({industries: translateLocal('dynamicForm.error.invalidOption')});
        expect(validErrors).toEqual({});
    });

    it('flags a multiselect answer holding something other than option keys', () => {
        // Given a required multiselect whose draft holds a list of booleans, which counts as answered since the list is not empty
        const industries: DynamicFormField = {key: 'industries', type: 'multiselect', required: true, values: [{key: 'RETAIL'}]};

        // When it is validated
        const errors = getDynamicFieldErrors([industries], {industries: [false]}, translateLocal);

        // Then the user is asked to pick from the options, rather than the list being sent with the stray entry
        expect(errors).toEqual({industries: translateLocal('dynamicForm.error.invalidOption')});
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

    it('checks an optional address like a required one once the user starts filling it in', () => {
        // Given an optional address
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: false};
        const addressKeys = getAddressInputKeys(homeAddress.key);

        // When it is validated untouched, with only the street filled in, with only the city filled in, and with only a country picked
        const untouchedErrors = getDynamicFieldErrors([homeAddress], {}, translateLocal);
        const streetOnlyErrors = getDynamicFieldErrors([homeAddress], {homeAddress: '1 High Street'}, translateLocal);
        const cityOnlyErrors = getDynamicFieldErrors([homeAddress], {[addressKeys.city]: 'London'}, translateLocal);
        const countryOnlyErrors = getDynamicFieldErrors([homeAddress], {[addressKeys.country]: CONST.COUNTRY.GB}, translateLocal);

        // Then skipping it is fine, but a started address flags every missing part, the street included, so it is never submitted in part
        const required = translateLocal('common.error.fieldRequired');
        expect(untouchedErrors).toEqual({});
        expect(streetOnlyErrors).toEqual({[addressKeys.city]: required, [addressKeys.state]: required, [addressKeys.zipCode]: required, [addressKeys.country]: required});
        expect(cityOnlyErrors).toEqual({homeAddress: required, [addressKeys.state]: required, [addressKeys.zipCode]: required, [addressKeys.country]: required});
        expect(countryOnlyErrors).toEqual({homeAddress: required, [addressKeys.city]: required, [addressKeys.zipCode]: required});
    });

    it('asks for a zip only where the country zip format needs one', () => {
        // Given a required address with a street and city, in Hong Kong, the United Arab Emirates and Great Britain
        const homeAddress: DynamicFormField = {key: 'homeAddress', type: 'address', required: true};
        const addressKeys = getAddressInputKeys(homeAddress.key);
        const getErrorsIn = (country: string) =>
            getDynamicFieldErrors([homeAddress], {homeAddress: '1 High Street', [addressKeys.city]: 'City', [addressKeys.country]: country}, translateLocal);

        // When each is validated without a zip
        const errorsByCountry = ['HK', 'AE', 'GB'].map(getErrorsIn);

        // Then only Great Britain asks for one, since the zip format of the other two accepts an empty zip
        expect(errorsByCountry).toEqual([{}, {}, {[addressKeys.zipCode]: translateLocal('common.error.fieldRequired')}]);
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

    it('accepts No as the answer to a Yes/No question wherever it sits, but not to a consent checkbox', () => {
        // Given a required Yes/No question and a required consent checkbox, sharing a page with another question
        const ownsQuarter: DynamicFormField = {key: 'ownsQuarter', type: 'boolean', required: true};
        const acceptTerms: DynamicFormField = {key: 'acceptTerms', type: 'boolean', required: true, presentation: 'checkbox'};
        const fullName: DynamicFormField = {key: 'fullName', type: 'text', required: false};

        // When the question is answered No, alone and among other fields, or not at all, and the checkbox is left empty
        const loneNoErrors = getDynamicFieldErrors([ownsQuarter], {ownsQuarter: false}, translateLocal);
        const sharedNoErrors = getDynamicFieldErrors([ownsQuarter, fullName], {ownsQuarter: false}, translateLocal);
        const unansweredErrors = getDynamicFieldErrors([ownsQuarter, fullName], {ownsQuarter: ''}, translateLocal);
        const consentErrors = getDynamicFieldErrors([acceptTerms, fullName], {acceptTerms: false}, translateLocal);

        // Then No answers the question however the page is grouped, while an unanswered question and an empty checkbox are flagged
        expect(loneNoErrors).toEqual({});
        expect(sharedNoErrors).toEqual({});
        expect(unansweredErrors).toEqual({ownsQuarter: translateLocal('common.error.fieldRequired')});
        expect(consentErrors).toEqual({acceptTerms: translateLocal('common.error.fieldRequired')});
    });

    it('checks a list for its size and for the first entry with a problem', () => {
        // Given a list of at least two directors, whose entries need a first name and may hold a sensitive SSN
        const directors: DynamicFormField = {
            key: 'directors',
            type: 'list',
            required: true,
            itemLabel: 'director',
            minItems: 2,
            itemFields: [
                {key: 'firstName', type: 'text', required: true},
                {key: 'ssn', type: 'text', required: true, sensitive: true},
            ],
        };

        // When it holds no entry, and when it holds one entry without a first name
        const emptyErrors = getDynamicFieldErrors([directors], {directors: []}, translateLocal);
        const shortErrors = getDynamicFieldErrors([directors], {directors: [{id: 'jane', firstName: ''}]}, translateLocal);

        // Then the empty list is required, and the short list shows both the size and the entry's first problem, naming the field and the entry by its numbered noun since the entry has no name to show
        const missingNameError = translateLocal('dynamicForm.error.itemError', {item: 'Director 1', field: 'firstName', error: translateLocal('common.error.fieldRequired')});
        expect(emptyErrors).toEqual({directors: translateLocal('common.error.fieldRequired')});
        expect(shortErrors).toEqual({directors: `${translateLocal('dynamicForm.error.tooFewItems', {min: 2})}\n${missingNameError}`});
    });

    it('asks again for a sensitive entry answer the memory no longer holds', () => {
        // Given a director whose required SSN is kept in memory apart from the drafted entry
        const directors: DynamicFormField = {
            key: 'directors',
            type: 'list',
            required: true,
            itemFields: [
                {key: 'firstName', type: 'text', required: true},
                {key: 'ssn', type: 'text', required: true, sensitive: true},
            ],
        };
        const draftValues = {directors: [{id: 'jane', firstName: 'Jane'}]};

        // When the SSN is in memory, and when the memory was lost, as after the app restarts
        const keptErrors = getDynamicFieldErrors([directors], {...draftValues, [getListItemSensitiveKey('directors', 'jane', 'ssn')]: '123456789'}, translateLocal);
        const lostErrors = getDynamicFieldErrors([directors], draftValues, translateLocal);

        // Then the list passes while the SSN is kept, and asks for it once it is lost, naming Jane and the SSN so the user knows what to fix, so a director is never submitted without one
        expect(keptErrors).toEqual({});
        expect(lostErrors).toEqual({directors: translateLocal('dynamicForm.error.itemError', {item: 'Jane', field: 'ssn', error: translateLocal('common.error.fieldRequired')})});
    });
});

describe('getDynamicFieldErrors with an answer the server holds', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    it('accepts a blank sensitive field the server already has an answer for', () => {
        // Given a required SSN the server returned as provided instead of sending it back
        const ssn: DynamicFormField = {key: 'ssn', type: 'text', required: true, sensitive: true};

        // When the field is left blank
        const errors = getDynamicFieldErrors([ssn], {ssnProvided: true}, translateLocal);

        // Then it counts as answered, so the stored SSN is kept
        expect(errors).toEqual({});
    });

    it('still requires a field that is not sensitive', () => {
        // Given a required plain field with a stray provided flag
        const firstName: DynamicFormField = {key: 'firstName', type: 'text', required: true};

        // When the field is left blank
        const errors = getDynamicFieldErrors([firstName], {firstNameProvided: true}, translateLocal);

        // Then the flag is ignored, since only sensitive answers are held back by the server
        expect(errors).toEqual({firstName: translateLocal('common.error.fieldRequired')});
    });
});
