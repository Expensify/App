import type {SubStepValues} from '@pages/ReimbursementAccount/NonUSD/utils/getBankInfoStepValues';
import getInitialSubStepForBankInfoStep from '@pages/ReimbursementAccount/NonUSD/utils/getInitialSubStepForBankInfoStep';

import type {ReimbursementAccountForm} from '@src/types/form';
import type {CorpayFields, CorpayFormField} from '@src/types/onyx';

import createMock from '../utils/createMock';

type BankInfoValues = SubStepValues<keyof ReimbursementAccountForm>;

function getField(id: string, isRequired: boolean, regEx: string): CorpayFormField {
    return createMock<CorpayFormField>({
        id,
        isRequired,
        validationRules: [{regEx, errorMessage: 'Invalid value'}],
    });
}

const corpayFields = createMock<CorpayFields>({
    formFields: [getField('accountNumber', true, '^[A-Z0-9]+$'), getField('routingCode', false, '^[0-9]{8}$'), getField('accountHolderName', true, '^.{3,100}$')],
});

describe('getInitialSubStepForBankInfoStep', () => {
    it('treats a blank optional field as complete', () => {
        // Given bank details where the optional routing code was left blank, like Poland's secondary routing code.
        const data = createMock<BankInfoValues>({accountNumber: 'PL61109010140000071219812874', routingCode: '', accountHolderName: 'John Doe'});

        // When the initial substep is calculated.
        const subStep = getInitialSubStepForBankInfoStep(data, corpayFields);

        // Then the user isn't sent back to the bank details substep, since there is nothing to validate.
        expect(subStep).toBe(2);
    });

    it('still sends the user back when an optional field has an invalid value', () => {
        // Given bank details where the optional routing code doesn't match its rule.
        const data = createMock<BankInfoValues>({accountNumber: 'PL61109010140000071219812874', routingCode: 'ABC', accountHolderName: 'John Doe'});

        // When the initial substep is calculated.
        const subStep = getInitialSubStepForBankInfoStep(data, corpayFields);

        // Then the user is sent to the bank details substep to fix it.
        expect(subStep).toBe(0);
    });

    it('still sends the user back when a required field is blank', () => {
        // Given bank details where the required account number is blank.
        const data = createMock<BankInfoValues>({accountNumber: '', routingCode: '', accountHolderName: 'John Doe'});

        // When the initial substep is calculated.
        const subStep = getInitialSubStepForBankInfoStep(data, corpayFields);

        // Then the user is sent to the bank details substep to fill it in.
        expect(subStep).toBe(0);
    });
});
