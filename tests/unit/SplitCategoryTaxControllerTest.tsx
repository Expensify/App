import {render} from '@testing-library/react-native';

import SplitCategoryTaxController from '@components/MoneyRequestConfirmationList/SplitCategoryTaxController';
import type {SplitCategoryTaxControllerProps} from '@components/MoneyRequestConfirmationList/SplitCategoryTaxController';

import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';

import React from 'react';

jest.mock('@libs/actions/IOU/Split', () => ({
    setDraftSplitTransaction: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => ({
    arePolicyRulesEnabled: () => true,
}));

let mockAreRulesLoading = false;

jest.mock('@hooks/useRulesPrefetch', () => ({
    __esModule: true,
    default: () => ({areRulesLoading: mockAreRulesLoading}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [{}],
}));

jest.mock('@hooks/useCurrencyList', () => ({
    useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'}),
}));

const mockSetDraftSplitTransaction = jest.mocked(setDraftSplitTransaction);

const transaction = {
    transactionID: 'txn1',
    amount: 1000,
    category: 'Car',
    created: '2026-11-10',
    currency: 'USD',
    merchant: 'Merchant',
    reportID: 'report1',
};

const baseProps: SplitCategoryTaxControllerProps = {
    transactionID: 'txn1',
    transaction,
    policy: undefined,
    policyCategories: undefined,
    isEditingSplitBill: true,
};

describe('SplitCategoryTaxController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAreRulesLoading = false;
    });

    it('replays the category once the rules land', () => {
        // Given a split draft rendered while the rules are still on their way, so a category picked now resolves
        // its tax without them
        mockAreRulesLoading = true;
        const {rerender} = render(<SplitCategoryTaxController {...baseProps} />);

        // When the rules land
        mockAreRulesLoading = false;
        rerender(<SplitCategoryTaxController {...baseProps} />);

        // Then the category is written again, which puts it back through the resolution the pick used
        expect(mockSetDraftSplitTransaction).toHaveBeenCalledWith('txn1', transaction, {category: 'Car'}, expect.any(Function), expect.any(Function), undefined, undefined, undefined, {});
    });

    it('leaves the draft alone when the rules were already there', () => {
        // Given a split draft rendered after the rules have landed, so its tax was resolved with them

        // When the screen renders and re-renders
        const {rerender} = render(<SplitCategoryTaxController {...baseProps} />);
        rerender(<SplitCategoryTaxController {...baseProps} />);

        // Then nothing is written, because a tax the user chose here would be overwritten by the replay
        expect(mockSetDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('leaves the draft alone when no category has been picked', () => {
        // Given a split draft with no category, rendered while the rules are on their way
        mockAreRulesLoading = true;
        const props = {...baseProps, transaction: {...transaction, category: undefined}};
        const {rerender} = render(<SplitCategoryTaxController {...props} />);

        // When the rules land
        mockAreRulesLoading = false;
        rerender(<SplitCategoryTaxController {...props} />);

        // Then nothing is written, because there is no category whose rule could apply
        expect(mockSetDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('leaves the draft alone when a split is not being edited', () => {
        // Given a confirmation that is not editing a split, so its tax is resolved by TaxController instead
        mockAreRulesLoading = true;
        const props = {...baseProps, isEditingSplitBill: false};
        const {rerender} = render(<SplitCategoryTaxController {...props} />);

        // When the rules land
        mockAreRulesLoading = false;
        rerender(<SplitCategoryTaxController {...props} />);

        // Then nothing is written, because this writes only to the split draft
        expect(mockSetDraftSplitTransaction).not.toHaveBeenCalled();
    });
});
