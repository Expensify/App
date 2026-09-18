import getDynamicFieldErrors from '@components/DynamicForm/getDynamicFieldErrors';
import groupFieldsIntoPages from '@components/DynamicForm/groupFieldsIntoPages';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';

import allFieldTypes from '../fixtures/wise/allFieldTypes';
import {translateLocal} from '../utils/TestHelper';

const completeAnswers = {
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
            accountNumber: translateLocal('dynamicForm.error.tooLong', {maxLength: 8}),
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

describe('groupFieldsIntoPages', () => {
    it('groups fields into pages in first-appearance order', () => {
        const pages = groupFieldsIntoPages(allFieldTypes);

        expect(pages.map((page) => page.name)).toEqual(['Account details', 'Account holder details']);
        expect(pages.at(0)?.fields.map((field) => field.key)).toEqual(['accountNumber', 'legalType', 'accountType', 'businessRegistrationDocument', 'annualVolume']);
        expect(pages.at(1)?.fields.map((field) => field.key)).toEqual(['dateOfBirth', 'country', 'address', 'useCases', 'isSourceOfFund']);
    });
});
