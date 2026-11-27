import {render} from '@testing-library/react-native';

import SplitCategoryTaxController from '@components/MoneyRequestConfirmationList/SplitCategoryTaxController';
import type {SplitCategoryTaxControllerProps} from '@components/MoneyRequestConfirmationList/SplitCategoryTaxController';

import {setDraftSplitTransaction} from '@libs/actions/IOU/Split';

import React from 'react';

const mockTranslate = jest.fn(() => 'Translated split');
jest.mock('@hooks/useLocalize', () => () => ({translate: mockTranslate}));

jest.mock('@libs/actions/IOU/Split', () => ({
    setDraftSplitTransaction: jest.fn(),
}));

jest.mock('@libs/PolicyUtils', () => ({
    arePolicyRulesEnabled: () => true,
}));

let mockAreRulesLoading = false;
let mockHaveRulesLoaded = true;

jest.mock('@hooks/useRulesPrefetch', () => ({
    __esModule: true,
    default: () => ({areRulesLoading: mockAreRulesLoading, haveRulesLoaded: mockHaveRulesLoaded}),
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
        mockHaveRulesLoaded = true;
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
            mockTranslate,
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

    it('replays a category cleared before the rules arrived', () => {
        // Given a split draft with a category, on a screen opened while the rules are on their way
        mockAreRulesLoading = true;
        const {rerender} = render(<SplitCategoryTaxController {...withCategory('Car')} />);

        // When the category is cleared and the rules land
        mockAreRulesLoading = false;
        rerender(<SplitCategoryTaxController {...withCategory('')} />);

        // Then the clear is written again, because the workspace default it falls back to is read from the rules,
        // so the pick itself left the previous category's tax in place
        expect(mockSetDraftSplitTransaction).toHaveBeenCalledWith(
            mockTranslate,
            'txn1',
            {...transaction, category: ''},
            {category: ''},
            expect.any(Function),
            expect.any(Function),
            undefined,
            undefined,
            undefined,
            {},
        );
    });

    it('replays a category picked while the rules fetch had failed, once a retry lands them', () => {
        // Given a split carrying the tax its previous category left, and a `GetRules` that failed, which settles
        // the wait with no rules
        mockHaveRulesLoaded = false;
        const withPreviousTax = (category: string | undefined) => withCategory(category, {transaction: {...transaction, category, taxCode: 'tax_previous'}});
        const {rerender} = render(<SplitCategoryTaxController {...withPreviousTax('Equipment')} />);

        // When the user picks a category, which has no rule to resolve against and so leaves that tax in place,
        // and a reconnect then lands the rules
        rerender(<SplitCategoryTaxController {...withPreviousTax('Car')} />);
        mockHaveRulesLoaded = true;
        rerender(<SplitCategoryTaxController {...withPreviousTax('Car')} />);

        // Then the pick is written a second time, because the rules it needed had not arrived the first time
        expect(mockSetDraftSplitTransaction).toHaveBeenCalledTimes(2);
    });

    it('drops the retry when the tax has been picked by hand since the category was', () => {
        // Given a category picked while the rules fetch had failed, which left the previous category's tax
        mockHaveRulesLoaded = false;
        const {rerender} = render(<SplitCategoryTaxController {...withCategory('Equipment', {transaction: {...transaction, category: 'Equipment', taxCode: 'tax_previous'}})} />);
        rerender(<SplitCategoryTaxController {...withCategory('Car', {transaction: {...transaction, category: 'Car', taxCode: 'tax_previous'}})} />);

        // When the user picks a tax by hand and a reconnect then lands the rules
        const manuallyTaxed = withCategory('Car', {transaction: {...transaction, category: 'Car', taxCode: 'tax_manual'}});
        rerender(<SplitCategoryTaxController {...manuallyTaxed} />);
        mockHaveRulesLoaded = true;
        rerender(<SplitCategoryTaxController {...manuallyTaxed} />);

        // Then nothing more is written, so the rate the user chose stands rather than the category rule replacing it
        expect(mockSetDraftSplitTransaction).toHaveBeenCalledTimes(1);
    });

    it('leaves the category the screen opened with alone when a retry lands the rules', () => {
        // Given a split draft that already carries a category, on a screen opened while the rules fetch had failed
        mockHaveRulesLoaded = false;
        const {rerender} = render(<SplitCategoryTaxController {...withCategory('Car')} />);

        // When a reconnect lands the rules
        mockHaveRulesLoaded = true;
        rerender(<SplitCategoryTaxController {...withCategory('Car')} />);

        // Then nothing is written, because a tax the user chose for that category would be overwritten
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
