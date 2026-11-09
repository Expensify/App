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

/** The props the screen has once a category has been picked on it. */
function withCategory(category: string | undefined, overrides: Partial<SplitCategoryTaxControllerProps> = {}): SplitCategoryTaxControllerProps {
    return {...baseProps, transaction: {...transaction, category}, ...overrides};
}

describe('SplitCategoryTaxController', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockAreRulesLoading = false;
    });

    it('replays a category picked before the rules arrived', () => {
        // Given a split draft with no category yet, on a screen opened while the rules are still on their way
        mockAreRulesLoading = true;
        const {rerender} = render(<SplitCategoryTaxController {...withCategory(undefined)} />);

        // When the user picks a category, which resolves its tax without the rules, and the rules then land
        rerender(<SplitCategoryTaxController {...withCategory('Car')} />);
        mockAreRulesLoading = false;
        rerender(<SplitCategoryTaxController {...withCategory('Car')} />);

        // Then the category is written again, which puts it back through the resolution the pick used
        expect(mockSetDraftSplitTransaction).toHaveBeenCalledWith(
            'txn1',
            {...transaction, category: 'Car'},
            {category: 'Car'},
            expect.any(Function),
            expect.any(Function),
            undefined,
            undefined,
            undefined,
            {},
        );
    });

    it('replays a category picked while the screen was covered by the category selector', () => {
        // Given a screen opened while the rules were on their way, whose effects then stop because the full page
        // category selector covers it. The rules land in that window, so no transition is ever seen here.
        mockAreRulesLoading = true;
        const {rerender} = render(<SplitCategoryTaxController {...withCategory(undefined)} />);
        mockAreRulesLoading = false;

        // When the user comes back having picked a category over there
        rerender(<SplitCategoryTaxController {...withCategory('Car')} />);

        // Then the pick is still reconciled, because this is keyed on which category has been resolved rather
        // than on the rules arriving
        expect(mockSetDraftSplitTransaction).toHaveBeenCalledTimes(1);
    });

    it('leaves the category the screen opened with alone', () => {
        // Given a split draft that already carries a category, on a screen opened after the rules landed

        // When the screen renders and re-renders
        const {rerender} = render(<SplitCategoryTaxController {...withCategory('Car')} />);
        rerender(<SplitCategoryTaxController {...withCategory('Car')} />);

        // Then nothing is written, because a tax the user chose for that category would be overwritten
        expect(mockSetDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('leaves the draft alone when only the tax changes', () => {
        // Given a split draft whose category has already been resolved
        const {rerender} = render(<SplitCategoryTaxController {...withCategory('Car')} />);

        // When the user picks a different tax by hand, leaving the category as it was
        rerender(<SplitCategoryTaxController {...withCategory('Car', {transaction: {...transaction, category: 'Car', taxCode: 'tax_manual'}})} />);

        // Then nothing is written, so the rate the user chose stands
        expect(mockSetDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('leaves the draft alone when the category is cleared', () => {
        // Given a split draft with a category, on a screen opened while the rules are on their way
        mockAreRulesLoading = true;
        const {rerender} = render(<SplitCategoryTaxController {...withCategory('Car')} />);

        // When the category is cleared and the rules land
        mockAreRulesLoading = false;
        rerender(<SplitCategoryTaxController {...withCategory('')} />);

        // Then nothing is written, because there is no category whose rule could apply
        expect(mockSetDraftSplitTransaction).not.toHaveBeenCalled();
    });

    it('leaves the draft alone when a split is not being edited', () => {
        // Given a confirmation that is not editing a split, so its tax is resolved by TaxController instead
        mockAreRulesLoading = true;
        const {rerender} = render(<SplitCategoryTaxController {...withCategory(undefined, {isEditingSplitBill: false})} />);

        // When a category is picked and the rules land
        rerender(<SplitCategoryTaxController {...withCategory('Car', {isEditingSplitBill: false})} />);
        mockAreRulesLoading = false;
        rerender(<SplitCategoryTaxController {...withCategory('Car', {isEditingSplitBill: false})} />);

        // Then nothing is written, because this writes only to the split draft
        expect(mockSetDraftSplitTransaction).not.toHaveBeenCalled();
    });
});
