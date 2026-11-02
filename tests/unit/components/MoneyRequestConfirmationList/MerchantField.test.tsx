import {render, renderHook, screen} from '@testing-library/react-native';

import MenuItem from '@components/MenuItem';
import ConfirmationFieldsProvider from '@components/MoneyRequestConfirmationFields/Provider';
import ExpenseFormLayoutContext, {dropdownRowsExpenseFormLayout} from '@components/MoneyRequestConfirmationList/sections/ExpenseFormLayoutContext';
import MerchantField from '@components/MoneyRequestConfirmationList/sections/MerchantField';

import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React from 'react';

let mockMerchantState = {merchant: '', isMerchantSet: false, hasReceipt: false};
jest.mock('@components/MoneyRequestConfirmationList/sections/useTransactionSelector', () => () => mockMerchantState);
jest.mock('@hooks/useOnyx', () => () => [undefined]);
jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));
jest.mock('@hooks/useCurrencyList', () => ({useCurrencyListActions: () => ({getCurrencyDecimals: () => 2, getCurrencySymbol: () => '$'})}));
jest.mock('@libs/actions/IOU/MoneyRequest', () => ({clearMoneyRequestMerchant: jest.fn(), setMoneyRequestMerchant: jest.fn()}));
jest.mock('@userActions/IOU/Split', () => ({setDraftSplitTransaction: jest.fn()}));

function renderMerchantField(props: Partial<React.ComponentProps<typeof MerchantField>> = {}) {
    return render(
        <ConfirmationFieldsProvider
            transactionID="1"
            reportID="2"
            action={CONST.IOU.ACTION.CREATE}
            iouType={CONST.IOU.TYPE.SUBMIT}
            isReadOnly
        >
            <ExpenseFormLayoutContext.Provider value={dropdownRowsExpenseFormLayout}>
                <MerchantField
                    isMerchantRequired
                    shouldDisplayFieldError={false}
                    formError=""
                    {...props}
                />
            </ExpenseFormLayoutContext.Provider>
        </ConfirmationFieldsProvider>,
    );
}

describe('MerchantField read-only dropdown row', () => {
    beforeEach(() => {
        mockMerchantState = {merchant: '', isMerchantSet: false, hasReceipt: false};
    });

    it('keeps a populated merchant non-interactive and hides Required', () => {
        // Given a locked expense whose merchant has already been supplied
        mockMerchantState = {merchant: 'Cafe', isMerchantSet: true, hasReceipt: false};
        const {result} = renderHook(() => useThemeStyles());

        // When the bordered confirmation form displays the merchant
        renderMerchantField();

        // Then it shows the value without offering a button or asking for an already filled field
        expect(screen.getByText('Cafe')).toBeOnTheScreen();
        expect(screen.UNSAFE_getByType(MenuItem.Root).props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({borderWidth: result.current.moneyRequestFieldRow.borderWidth}), result.current.moneyRequestFieldRowDisabled]),
        );
        expect(screen.queryByRole('button')).toBeNull();
        expect(screen.queryByText('common.required')).toBeNull();
    });

    it('shows Required for an empty required merchant', () => {
        // Given a locked expense that still needs its merchant
        // When the bordered confirmation form displays the empty merchant
        renderMerchantField();

        // Then the field preserves its required hint without offering an edit control
        expect(screen.getByText('common.required')).toBeOnTheScreen();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it('does not show Required for an optional merchant', () => {
        // Given a locked expense whose merchant is optional
        // When the bordered confirmation form displays the empty merchant
        renderMerchantField({isMerchantRequired: false});

        // Then it does not ask for a value that is not required
        expect(screen.queryByText('common.required')).toBeNull();
        expect(screen.queryByRole('button')).toBeNull();
    });

    it.each([
        {formError: '', shouldDisplayFieldError: true, expectedError: 'common.error.fieldRequired'},
        {formError: 'iou.error.invalidMerchant', shouldDisplayFieldError: false, expectedError: 'iou.error.invalidMerchant'},
    ])('shows $expectedError on the locked merchant row', ({formError, shouldDisplayFieldError, expectedError}) => {
        // Given a merchant validation failure that must remain visible even when the field is locked
        // When the bordered confirmation form displays that failure
        renderMerchantField({formError, shouldDisplayFieldError});

        // Then the actual validation message is preserved and the row still has no edit control
        expect(screen.getByText(expectedError)).toBeOnTheScreen();
        expect(screen.queryByRole('button')).toBeNull();
    });
});
