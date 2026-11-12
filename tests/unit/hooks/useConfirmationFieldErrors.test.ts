import {act, renderHook} from '@testing-library/react-native';

import type {ConfirmationField, ConfirmationFieldErrors, SiblingFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import {NO_FIELD_ERRORS} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import useConfirmationFieldErrors from '@components/MoneyRequestConfirmationList/hooks/useConfirmationFieldErrors';

type Props = {
    fieldErrors: ConfirmationFieldErrors;
    siblingFieldErrors?: SiblingFieldErrors;
    onSwitchToTransaction?: (transactionID: string) => void;
    onRevealField: (field: ConfirmationField, transactionID: string | undefined) => void;
};

const ON_SCREEN_TRANSACTION_ID = 'txn1';
const MISSING_AMOUNT: ConfirmationFieldErrors = {amount: 'common.error.fieldRequired'};
const PARTIALLY_FILLED_SIBLING: SiblingFieldErrors = {transactionID: 'txn2', fieldErrors: MISSING_AMOUNT};

function renderFieldErrors(initialProps: Props) {
    return renderHook(
        ({fieldErrors, siblingFieldErrors, onSwitchToTransaction, onRevealField}: Props) =>
            useConfirmationFieldErrors({transactionID: ON_SCREEN_TRANSACTION_ID, fieldErrors, siblingFieldErrors, onSwitchToTransaction, onRevealField}),
        {initialProps},
    );
}

describe('useConfirmationFieldErrors', () => {
    it('keeps the field errors hidden until a confirm is blocked by them', () => {
        // Given a confirmation whose amount is missing, before the user pressed the confirm button
        // When it renders
        const {result} = renderFieldErrors({fieldErrors: MISSING_AMOUNT, onRevealField: jest.fn()});

        // Then the field doesn't flag anything yet
        expect(result.current.visibleFieldErrors).toBe(NO_FIELD_ERRORS);
    });

    it.each([
        ['the amount when the merchant is flagged too', {amount: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'}, undefined, 'amount', ON_SCREEN_TRANSACTION_ID],
        ['the merchant when the date is flagged too', {date: 'common.error.fieldRequired', merchant: 'iou.error.invalidMerchant'}, undefined, 'merchant', ON_SCREEN_TRANSACTION_ID],
        ['the date when it is the only one flagged', {date: 'common.error.fieldRequired'}, undefined, 'date', ON_SCREEN_TRANSACTION_ID],
        [
            'the flagged field of another receipt when the one on screen has none',
            NO_FIELD_ERRORS,
            {transactionID: 'txn2', fieldErrors: {merchant: 'iou.error.invalidMerchant'}},
            'merchant',
            'txn2',
        ],
    ] as const)('scrolls to %s once a confirm is blocked', (_case, fieldErrors, siblingFieldErrors, expectedField, expectedTransactionID) => {
        // Given a confirmation whose receipt on screen, or another receipt of the multi-scan, holds these field errors
        const onRevealField = jest.fn();
        const {result} = renderFieldErrors({fieldErrors, siblingFieldErrors, onRevealField});

        // When the confirm is blocked by them
        act(() => result.current.revealFieldErrors());

        // Then the first flagged field in screen order is scrolled into view, so the user reaches the error they meet first even if they had scrolled past it
        expect(onRevealField).toHaveBeenCalledWith(expectedField, expectedTransactionID);
    });

    it('keeps the errors shown while any field is still missing, and hides them once all are filled in', () => {
        // Given a blocked confirm with both the amount and the merchant missing
        const {result, rerender} = renderFieldErrors({fieldErrors: {amount: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'}, onRevealField: jest.fn()});
        act(() => result.current.revealFieldErrors());

        // When only the amount is filled in
        rerender({fieldErrors: {merchant: 'common.error.fieldRequired'}, onRevealField: jest.fn()});

        // Then the merchant is still flagged
        expect(result.current.visibleFieldErrors).toEqual({merchant: 'common.error.fieldRequired'});

        // When the merchant is filled in as well, and the user then empties a field again
        rerender({fieldErrors: NO_FIELD_ERRORS, onRevealField: jest.fn()});
        rerender({fieldErrors: MISSING_AMOUNT, onRevealField: jest.fn()});

        // Then it is only flagged on the next blocked confirm, as before the first one
        expect(result.current.visibleFieldErrors).toBe(NO_FIELD_ERRORS);
    });

    it('keeps an invalid value on the receipt on screen in view before moving to a partially filled sibling', () => {
        // Given a multi-scan whose receipt on screen has a typed merchant that isn't allowed, while a sibling receipt is partially filled
        const onSwitchToTransaction = jest.fn();
        const onRevealField = jest.fn();
        const {result, rerender} = renderFieldErrors({
            fieldErrors: {merchant: 'iou.error.invalidMerchant'},
            siblingFieldErrors: PARTIALLY_FILLED_SIBLING,
            onSwitchToTransaction,
            onRevealField,
        });

        // When the confirm is blocked
        act(() => result.current.revealFieldErrors());

        // Then the receipt on screen stays and its merchant is scrolled into view, so its error is seen
        expect(onSwitchToTransaction).not.toHaveBeenCalled();
        expect(onRevealField).toHaveBeenLastCalledWith('merchant', ON_SCREEN_TRANSACTION_ID);

        // When the user fixes the merchant and confirms again
        rerender({fieldErrors: NO_FIELD_ERRORS, siblingFieldErrors: PARTIALLY_FILLED_SIBLING, onSwitchToTransaction, onRevealField});
        act(() => result.current.revealFieldErrors());

        // Then the partially filled sibling is brought on screen and scrolled to its missing amount, since the receipt on screen has nothing left to fix
        expect(onSwitchToTransaction).toHaveBeenCalledWith('txn2');
        expect(onRevealField).toHaveBeenLastCalledWith('amount', 'txn2');
    });
});
