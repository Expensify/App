import {render} from '@testing-library/react-native';

import FormProvider from '@components/Form/FormProvider';

import {validateBankAccount} from '@libs/actions/BankAccounts';

import BankAccountValidationForm from '@pages/ReimbursementAccount/USD/ConnectBankAccount/components/BankAccountValidationForm';

import type {ReimbursementAccountForm} from '@src/types/form';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

import React from 'react';

import createMock from '../utils/createMock';

jest.mock('@components/Form/FormProvider', () => jest.fn(({children}: React.PropsWithChildren) => children));
jest.mock('@components/Form/InputWrapper', () => jest.fn(() => null));
jest.mock('@pages/ReimbursementAccount/USD/ConnectBankAccount/components/Enable2FACard', () => jest.fn(() => null));
jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: (key: string) => key, toLocaleDigit: (value: string) => value})));
jest.mock('@hooks/useThemeStyles', () => jest.fn(() => ({mh5: {}, flexGrow1: {}, mv5: {}, mb6: {}, mln5: {}, mrn5: {}, mt3: {}})));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2})}));
jest.mock('@libs/actions/BankAccounts', () => ({validateBankAccount: jest.fn()}));

describe('BankAccountValidationForm', () => {
    const form = jest.mocked(FormProvider);
    const bankAction = jest.mocked(validateBankAccount);
    const values = (amount1: string, amount2: string, amount3: string) => createMock<ReimbursementAccountForm>({amount1, amount2, amount3});

    beforeEach(() => {
        form.mockClear();
        bankAction.mockClear();
    });

    it('validates the three finite amount fields in order', () => {
        // Given the real form validation callback, so the test covers the submitted amount fields.
        render(
            <BankAccountValidationForm
                requiresTwoFactorAuth
                policy={undefined}
            />,
        );
        const validate = form.mock.lastCall?.[0].validate;

        // When blank, zero and excessive precision amounts are checked, each must be rejected.
        const invalid = validate?.(values('', '0', '1.234'), jest.fn());

        // Then each amount has its own ordered error key.
        expect(Object.keys(invalid ?? {})).toEqual([INPUT_IDS.AMOUNT1, INPUT_IDS.AMOUNT2, INPUT_IDS.AMOUNT3]);
        expect(Object.values(invalid ?? {})).toEqual(['common.error.invalidAmount', 'common.error.invalidAmount', 'common.error.invalidAmount']);

        // When validation checks amounts with permitted precision, the same callback must accept them.
        // Then valid amounts produce no validation errors.
        expect(validate?.(values('0.01', '1.23', '2'), jest.fn())).toEqual({});
    });

    it('submits the amount code only when a bank account ID exists', () => {
        // Given a form without a bank account ID.
        render(
            <BankAccountValidationForm
                requiresTwoFactorAuth
                policy={undefined}
            />,
        );

        // When the form submits without an ID, there is no account to validate.
        form.mock.lastCall?.[0].onSubmit?.(values('0.01', '1.20', '2'));

        // Then the bank validation action must not run.
        expect(bankAction).not.toHaveBeenCalled();

        // When the bank account ID is present, the real submit callback preserves amount order.
        render(
            <BankAccountValidationForm
                requiresTwoFactorAuth
                policy={undefined}
                reimbursementAccount={createMock<ReimbursementAccount>({achData: {bankAccountID: 123}})}
            />,
        );
        form.mock.lastCall?.[0].onSubmit?.(values('0.01', '1.20', '2'));

        // Then the action receives the account ID and the amount code in field order.
        expect(bankAction).toHaveBeenCalledWith(123, '.01,1.2,2', undefined);
    });
});
