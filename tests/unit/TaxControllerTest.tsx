import {render} from '@testing-library/react-native';

import TaxController from '@components/MoneyRequestConfirmationList/TaxController';
import type {TaxControllerProps} from '@components/MoneyRequestConfirmationList/TaxController';

import {setMoneyRequestTaxAmount, setMoneyRequestTaxRateValues} from '@libs/actions/IOU/MoneyRequest';

import React from 'react';

jest.mock('@libs/actions/IOU/MoneyRequest', () => ({
    setMoneyRequestTaxAmount: jest.fn(),
    setMoneyRequestTaxRateValues: jest.fn(),
}));

let mockCategoryTaxCode: string | undefined;
let mockShouldHoldBackDefault = false;

jest.mock('@components/MoneyRequestConfirmationList/hooks/useTaxAmount', () => ({
    __esModule: true,
    default: () => ({
        categoryTaxCode: mockCategoryTaxCode,
        defaultTaxCode: mockCategoryTaxCode ?? 'tax_default',
        defaultTaxValue: '10%',
        shouldHoldBackDefault: mockShouldHoldBackDefault,
        shouldKeepCurrentTaxSelection: false,
        taxAmountInSmallestCurrencyUnits: 10000,
        areRulesLoading: false,
    }),
}));

const mockSetMoneyRequestTaxRateValues = jest.mocked(setMoneyRequestTaxRateValues);
const mockSetMoneyRequestTaxAmount = jest.mocked(setMoneyRequestTaxAmount);

const baseProps: TaxControllerProps = {
    transactionID: 'txn1',
    policyID: 'policy1',
    isReadOnly: false,
    shouldShowTax: true,
    isMovingTransactionFromTrackExpense: false,
    transaction: {
        transactionID: 'txn1',
        amount: 1000,
        created: '2026-11-05',
        currency: 'USD',
        merchant: 'Merchant',
        reportID: 'report1',
    },
    policy: undefined,
    policyForMovingExpenses: undefined,
    customUnitRateID: '',
};

describe('TaxController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockCategoryTaxCode = undefined;
        mockShouldHoldBackDefault = false;
    });

    it('writes the category rule rate onto a track expense being moved', () => {
        // Given a tracked expense being submitted to a workspace whose category carries a tax rule
        mockCategoryTaxCode = 'tax_category';

        // When the confirmation page syncs the tax
        render(
            <TaxController
                {...baseProps}
                isMovingTransactionFromTrackExpense
            />,
        );

        // Then the rule's rate is written, because an admin chose it for every expense in that category
        expect(mockSetMoneyRequestTaxRateValues).toHaveBeenCalledWith('txn1', {taxCode: 'tax_category', taxValue: '10%', taxAmount: null});
        expect(mockSetMoneyRequestTaxAmount).toHaveBeenCalledWith('txn1', 10000);
    });

    it('leaves a moved track expense on the tax it arrived with when no category rule applies', () => {
        // Given a tracked expense being submitted to a workspace where its category carries no tax rule
        mockShouldHoldBackDefault = true;

        // When the confirmation page syncs the tax
        render(
            <TaxController
                {...baseProps}
                isMovingTransactionFromTrackExpense
            />,
        );

        // Then nothing is written, because the destination's default is a rate nobody chose for this expense
        expect(mockSetMoneyRequestTaxRateValues).not.toHaveBeenCalled();
        expect(mockSetMoneyRequestTaxAmount).not.toHaveBeenCalled();
    });

    it('writes the rate reported for a moved track expense once a category rule has been dropped', () => {
        // Given a moved track expense whose rate the hook has resolved back to the one it arrived with
        mockCategoryTaxCode = undefined;

        // When the confirmation page syncs the tax
        render(
            <TaxController
                {...baseProps}
                isMovingTransactionFromTrackExpense
            />,
        );

        // Then it is written, because leaving it alone would keep the rate the category it just left had put there
        expect(mockSetMoneyRequestTaxRateValues).toHaveBeenCalledWith('txn1', {taxCode: 'tax_default', taxValue: '10%', taxAmount: null});
    });

    it('writes the workspace default for an expense that is not being moved', () => {
        // Given an expense created on the workspace rather than moved onto it

        // When the confirmation page syncs the tax
        render(<TaxController {...baseProps} />);

        // Then the default is written as before, so holding it back is limited to the move
        expect(mockSetMoneyRequestTaxRateValues).toHaveBeenCalledWith('txn1', {taxCode: 'tax_default', taxValue: '10%', taxAmount: null});
    });
});
