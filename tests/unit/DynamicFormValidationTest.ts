import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import groupFieldsIntoPages from '@components/DynamicForm/groupFieldsIntoPages';

import {getCountryZipRegexDetails} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {DynamicFormField} from '@src/types/onyx';

import {addYears, format, subYears} from 'date-fns';

import allFieldTypes from '../fixtures/dynamicForm/allFieldTypes';
import {translateLocal} from '../utils/TestHelper';

const completeAnswers = {
    ownershipPercentage: '40',
    accountNumber: '12345678',
    legalType: 'PRIVATE',
    accountType: 'CHECKING',
    annualVolume: '1000',
    dateOfBirth: '1990-01-31',
    country: 'GB',
    address: '1 High Street',
    useCases: ['PAYING_SUPPLIERS_CONTRACTORS_EMPLOYEES'],
};

describe('getDynamicFieldErrors', () => {
    beforeAll(() => {
        IntlStore.load(CONST.LOCALES.DEFAULT);
    });

    it('flags a missing required field and nothing else', () => {
        const errors = getDynamicFieldErrors(allFieldTypes, {...completeAnswers, accountNumber: ''}, translateLocal);

        expect(errors).toEqual({accountNumber: translateLocal('common.error.fieldRequired')});
    });

    it('flags a regex failure with the translated message', () => {
        const errors = getDynamicFieldErrors(allFieldTypes, {...completeAnswers, accountNumber: 'ABCDEFGH'}, translateLocal);

        expect(errors).toEqual({accountNumber: translateLocal('dynamicForm.error.invalidFormat', {example: '12345678'})});
    });

    it('flags minLength and maxLength', () => {
        const fields = allFieldTypes.map((field) => (field.key === 'accountNumber' ? {...field, regex: undefined} : field));

        expect(getDynamicFieldErrors(fields, {...completeAnswers, accountNumber: '1234'}, translateLocal)).toEqual({
            accountNumber: translateLocal('dynamicForm.error.tooShort', {minLength: 8}),
        });
        expect(getDynamicFieldErrors(fields, {...completeAnswers, accountNumber: '123456789'}, translateLocal)).toEqual({
            accountNumber: translateLocal('common.error.characterLimitExceedCounter', 9, 8),
        });
    });

    it('flags an invalid date', () => {
        const errors = getDynamicFieldErrors(allFieldTypes, {...completeAnswers, dateOfBirth: '1990-13-45'}, translateLocal);

        expect(errors).toEqual({dateOfBirth: translateLocal('dynamicForm.error.invalidDate')});
    });

    it('never flags a field hidden by showWhen', () => {
        expect(getDynamicFieldErrors(allFieldTypes, completeAnswers, translateLocal)).toEqual({});
        expect(getDynamicFieldErrors(allFieldTypes, {...completeAnswers, legalType: 'BUSINESS'}, translateLocal)).toEqual({
            businessRegistrationDocument: translateLocal('common.error.fieldRequired'),
        });
    });
});

describe('getDynamicFieldErrors for lists and percentages', () => {
    const shareholders = allFieldTypes.find((field) => field.key === 'legalEntityShareholders');
    if (!shareholders) {
        throw new Error('fixture changed');
    }
    const requiredShareholders = {...shareholders, required: true, minItems: 2};

    it('flags a percentage outside 1 to 100', () => {
        expect(getDynamicFieldErrors(allFieldTypes, {...completeAnswers, ownershipPercentage: '120'}, translateLocal)).toEqual({
            ownershipPercentage: translateLocal('dynamicForm.error.outOfRange', {min: 1, max: 100}),
        });
    });

    it('flags too few items and a broken item, and accepts a valid list', () => {
        const validItem = {id: '1', name: 'Acme Holdings', country: 'GB', ownershipPercentage: '30'};
        const brokenItem = {id: '2', name: '', country: 'GB', ownershipPercentage: '30'};

        expect(getDynamicFieldErrors([requiredShareholders], {legalEntityShareholders: []}, translateLocal)).toEqual({
            legalEntityShareholders: translateLocal('common.error.fieldRequired'),
        });
        expect(getDynamicFieldErrors([requiredShareholders], {legalEntityShareholders: [validItem]}, translateLocal)).toEqual({
            legalEntityShareholders: translateLocal('dynamicForm.error.tooFewItems', {min: 2}),
        });
        expect(getDynamicFieldErrors([requiredShareholders], {legalEntityShareholders: [validItem, brokenItem]}, translateLocal)).toEqual({
            legalEntityShareholders: translateLocal('common.error.fieldRequired'),
        });
        expect(getDynamicFieldErrors([requiredShareholders], {legalEntityShareholders: [validItem, {...validItem, id: '3'}]}, translateLocal)).toEqual({});
    });

    it('reports every failing rule on one field and skips readonly fields', () => {
        const fields = allFieldTypes.map((field) => (field.key === 'accountNumber' ? {...field, regex: '^[A-Z]+$', minLength: 12} : field));
        const errors = getDynamicFieldErrors(fields, {...completeAnswers, accountNumber: '12345678'}, translateLocal);
        expect(errors.accountNumber).toBe(
            [translateLocal('dynamicForm.error.invalidFormat', {example: '12345678'}), translateLocal('dynamicForm.error.tooShort', {minLength: 12})].join('\n'),
        );

        const readonly = allFieldTypes.map((field) => (field.key === 'accountNumber' ? {...field, readonly: true} : field));
        expect(getDynamicFieldErrors(readonly, {...completeAnswers, accountNumber: ''}, translateLocal)).toEqual({});
    });
});

describe('getDynamicFieldErrors for choices and booleans', () => {
    it('rejects a dependent answer that the current controlling answer no longer offers', () => {
        const stale = getDynamicFieldErrors(allFieldTypes, {...completeAnswers, legalType: 'PRIVATE', accountType: 'BUSINESS_CHECKING'}, translateLocal);
        expect(stale.accountType).toBe(translateLocal('dynamicForm.error.invalidOption'));

        expect(getDynamicFieldErrors(allFieldTypes, {...completeAnswers, legalType: 'BUSINESS', accountType: 'BUSINESS_CHECKING'}, translateLocal).accountType).toBeUndefined();
    });

    it('accepts No for a required boolean asked alone on its page but not for a consent box among other fields', () => {
        const consent = allFieldTypes.find((field) => field.key === 'isSourceOfFund');
        if (!consent) {
            throw new Error('fixture changed');
        }
        const requiredConsent = {...consent, required: true};

        expect(getDynamicFieldErrors([requiredConsent], {isSourceOfFund: false}, translateLocal)).toEqual({});
        expect(getDynamicFieldErrors([requiredConsent], {}, translateLocal)).toEqual({isSourceOfFund: translateLocal('common.error.fieldRequired')});

        const withSibling = [requiredConsent, {...requiredConsent, key: 'other', type: 'text' as const}];
        expect(getDynamicFieldErrors(withSibling, {isSourceOfFund: false, other: 'x'}, translateLocal)).toEqual({isSourceOfFund: translateLocal('common.error.fieldRequired')});
        expect(getDynamicFieldErrors(withSibling, {isSourceOfFund: true, other: 'x'}, translateLocal)).toEqual({});
    });
});

describe('getDynamicFieldErrors counts readonly rows like the renderer', () => {
    it('treats a consent box beside a readonly row as a box that must be ticked', () => {
        const legalName: DynamicFormField = {key: 'legalName', label: 'Legal name', group: 'Business', type: 'text', required: true, readonly: true, refreshOnChange: false};
        const consent: DynamicFormField = {key: 'consent', label: 'I agree', group: 'Business', type: 'boolean', required: true, refreshOnChange: false};

        expect(getDynamicFieldErrors([legalName, consent], {legalName: 'Acme Inc', consent: false}, translateLocal)).toEqual({consent: translateLocal('common.error.fieldRequired')});
        expect(getDynamicFieldErrors([consent], {consent: false}, translateLocal)).toEqual({});
    });
});

describe('getDynamicFieldErrors named rules', () => {
    const firstName: DynamicFormField = {key: 'firstName', label: 'First name', group: 'Owner', type: 'text', required: true, rule: 'legalName', refreshOnChange: false};
    const dateOfBirth: DynamicFormField = {key: 'dateOfBirth', label: 'Date of birth', group: 'Owner', type: 'date', required: true, rule: 'dateOfBirth', refreshOnChange: false};
    const address: DynamicFormField = {key: 'address', label: 'Address', group: 'Owner', type: 'address', required: true, rule: 'zipCode', refreshOnChange: false};

    it('rejects digits and symbols in a legal name', () => {
        expect(getDynamicFieldErrors([firstName], {firstName: 'R2D2'}, translateLocal)).toEqual({firstName: translateLocal('privatePersonalDetails.error.hasInvalidCharacter')});
        expect(getDynamicFieldErrors([firstName], {firstName: 'Alice'}, translateLocal)).toEqual({});
    });

    it('requires a date of birth in the past for an adult', () => {
        const nextYear = format(addYears(new Date(), 1), CONST.DATE.FNS_FORMAT_STRING);
        const tenYearsAgo = format(subYears(new Date(), 10), CONST.DATE.FNS_FORMAT_STRING);

        expect(getDynamicFieldErrors([dateOfBirth], {dateOfBirth: nextYear}, translateLocal)).toEqual({dateOfBirth: translateLocal('bankAccount.error.dob')});
        expect(getDynamicFieldErrors([dateOfBirth], {dateOfBirth: tenYearsAgo}, translateLocal)).toEqual({dateOfBirth: translateLocal('bankAccount.error.age')});
        expect(getDynamicFieldErrors([dateOfBirth], {dateOfBirth: '1990-01-31'}, translateLocal)).toEqual({});
    });

    it('checks the zip code against the chosen country', () => {
        const answers = {address: '1 Main Street', ['address.country']: 'US', ['address.zipCode']: 'ABC'};

        expect(getDynamicFieldErrors([address], answers, translateLocal)).toEqual({
            address: translateLocal('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails('US')?.samples),
        });
        expect(getDynamicFieldErrors([address], {...answers, ['address.zipCode']: '10001'}, translateLocal)).toEqual({});
    });
});

describe('groupFieldsIntoPages', () => {
    it('groups fields into pages in first-appearance order', () => {
        const pages = groupFieldsIntoPages(allFieldTypes);

        expect(pages.map((page) => page.name)).toEqual(['Account details', 'Account holder details', 'Ownership']);
        expect(pages.at(0)?.fields.map((field) => field.key)).toEqual(['accountNumber', 'legalType', 'accountType', 'businessRegistrationDocument', 'annualVolume']);
        expect(pages.at(1)?.fields.map((field) => field.key)).toEqual(['dateOfBirth', 'country', 'address', 'useCases', 'isSourceOfFund']);
    });

    it('keeps route slugs unique and non-empty when group names collide or have no latin characters', () => {
        const text = (key: string, group: string): DynamicFormField => ({key, label: key, group, type: 'text', required: true, refreshOnChange: false});
        const pages = groupFieldsIntoPages([text('a', 'KYC / AML'), text('b', 'KYC & AML'), text('c', '日本')]);

        expect(pages.map((page) => page.slug)).toEqual(['kyc-aml', 'kyc-aml-2', 'page-3']);
    });
});
