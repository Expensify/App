import {act, renderHook} from '@testing-library/react-native';

import type {ConfirmationFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import {NO_FIELD_ERRORS} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import useConfirmationFieldErrors from '@components/MoneyRequestConfirmationList/hooks/useConfirmationFieldErrors';

jest.mock('@hooks/useLocalize', () => () => ({translate: (key: string) => key}));

type Props = {
    fieldErrors: ConfirmationFieldErrors;
    partiallyManuallyFilledScanID?: string;
    onSwitchToTransaction?: (transactionID: string) => void;
    formErrorMessage?: string;
    routeError?: string;
};

const MISSING_AMOUNT: ConfirmationFieldErrors = {amount: 'common.error.fieldRequired'};

function renderFieldErrors(initialProps: Props) {
    return renderHook(
        ({fieldErrors, partiallyManuallyFilledScanID, onSwitchToTransaction, formErrorMessage, routeError}: Props) =>
            useConfirmationFieldErrors({fieldErrors, partiallyManuallyFilledScanID, onSwitchToTransaction, formErrorMessage, routeError}),
        {initialProps},
    );
}

describe('useConfirmationFieldErrors', () => {
    it('keeps the field errors hidden until a confirm is blocked by them', () => {
        // Given a confirmation whose amount is missing, before the user pressed the confirm button
        // When it renders
        const {result} = renderFieldErrors({fieldErrors: MISSING_AMOUNT});

        // Then neither the field nor the footer flags anything yet
        expect(result.current.visibleFieldErrors).toBe(NO_FIELD_ERRORS);
        expect(result.current.footerErrorMessage).toBeUndefined();
    });

    it('shows the field errors and the footer summary once a confirm is blocked', () => {
        // Given a confirmation whose amount is missing
        const {result} = renderFieldErrors({fieldErrors: MISSING_AMOUNT});

        // When the confirm is blocked by it
        act(() => result.current.revealFieldErrors());

        // Then the amount shows its error, and the summary above the button explains the block even if the amount is scrolled away
        expect(result.current.visibleFieldErrors).toEqual(MISSING_AMOUNT);
        expect(result.current.footerErrorMessage).toBe('iou.error.enterRequiredFields');
    });

    it('asks to fix the errors when every field error is an invalid value rather than a missing one', () => {
        // Given a confirmation whose only field error is an invalid amount, such as a negative amount to a person
        const {result} = renderFieldErrors({fieldErrors: {amount: 'common.error.invalidAmount'}});

        // When the confirm is blocked by it
        act(() => result.current.revealFieldErrors());

        // Then the field shows it, and the footer uses the line other forms show, since nothing is missing for "required fields" to describe
        expect(result.current.visibleFieldErrors).toEqual({amount: 'common.error.invalidAmount'});
        expect(result.current.footerErrorMessage).toBe('common.error.fixErrorsBeforeContinuing');
    });

    it('asks for the required fields when a missing value and an invalid one block together', () => {
        // Given a confirmation with a missing date and an invalid merchant
        const {result} = renderFieldErrors({fieldErrors: {date: 'common.error.fieldRequired', merchant: 'iou.error.invalidMerchant'}});

        // When the confirm is blocked by them
        act(() => result.current.revealFieldErrors());

        // Then the footer asks for the required fields, since the missing value is what the user has to add first
        expect(result.current.footerErrorMessage).toBe('iou.error.enterRequiredFields');
    });

    it('keeps the errors shown while any field is still missing, and hides them once all are filled in', () => {
        // Given a blocked confirm with both the amount and the merchant missing
        const {result, rerender} = renderFieldErrors({fieldErrors: {amount: 'common.error.fieldRequired', merchant: 'common.error.fieldRequired'}});
        act(() => result.current.revealFieldErrors());

        // When only the amount is filled in
        rerender({fieldErrors: {merchant: 'common.error.fieldRequired'}});

        // Then the merchant and the summary still show
        expect(result.current.visibleFieldErrors).toEqual({merchant: 'common.error.fieldRequired'});
        expect(result.current.footerErrorMessage).toBe('iou.error.enterRequiredFields');

        // When the merchant is filled in as well
        rerender({fieldErrors: NO_FIELD_ERRORS});

        // Then nothing is flagged
        expect(result.current.visibleFieldErrors).toBe(NO_FIELD_ERRORS);
        expect(result.current.footerErrorMessage).toBeUndefined();

        // When the user empties a field again afterwards
        rerender({fieldErrors: MISSING_AMOUNT});

        // Then it is only flagged on the next blocked confirm, as before the first one
        expect(result.current.visibleFieldErrors).toBe(NO_FIELD_ERRORS);
        expect(result.current.footerErrorMessage).toBeUndefined();
    });

    it('puts the summary over a form error raised elsewhere, and leaves that error to block once the fields are filled in', () => {
        // Given a distance expense whose rate error is in the footer, and whose date is missing
        const rateError = 'iou.error.invalidRate';
        const {result, rerender} = renderFieldErrors({fieldErrors: {date: 'common.error.fieldRequired'}, formErrorMessage: rateError});

        // When a confirm is blocked by the missing date
        act(() => result.current.revealFieldErrors());

        // Then the summary takes the footer, since the date may be scrolled out of view
        expect(result.current.footerErrorMessage).toBe('iou.error.enterRequiredFields');

        // When the date is filled in while the rate is still out of policy
        rerender({fieldErrors: NO_FIELD_ERRORS, formErrorMessage: rateError});

        // Then the rate error is back in the footer, as it was never cleared and still blocks confirming
        expect(result.current.footerErrorMessage).toBe(rateError);
    });

    it('keeps a route error in the footer over the summary and any other form error', () => {
        // Given a distance expense whose route failed to load, with its date missing and another form error set
        const routeError = 'Could not load the route';
        const {result} = renderFieldErrors({fieldErrors: {date: 'common.error.fieldRequired'}, formErrorMessage: 'Please select a valid distance rate', routeError});

        // When nothing has been confirmed yet
        // Then the route error shows over the form error
        expect(result.current.footerErrorMessage).toBe(routeError);

        // When the field errors are revealed
        act(() => result.current.revealFieldErrors());

        // Then the route error stays over the summary, since the expense can't be confirmed until the route loads
        expect(result.current.footerErrorMessage).toBe(routeError);
    });

    it('brings the partially filled sibling receipt on screen when the receipt on screen is complete', () => {
        // Given a multi-scan whose receipt on screen is complete while a sibling receipt is partially filled
        const onSwitchToTransaction = jest.fn();
        const {result} = renderFieldErrors({fieldErrors: NO_FIELD_ERRORS, partiallyManuallyFilledScanID: 'txn2', onSwitchToTransaction});

        // When the confirm is blocked by the sibling
        act(() => result.current.revealFieldErrors());

        // Then the sibling is brought on screen, so its blank fields show their errors instead of Create looking like it did nothing
        expect(onSwitchToTransaction).toHaveBeenCalledWith('txn2');
    });

    it('keeps an invalid value on the receipt on screen in view before moving to a partially filled sibling', () => {
        // Given a multi-scan whose receipt on screen has a typed merchant that isn't allowed, while a sibling receipt is partially filled
        const onSwitchToTransaction = jest.fn();
        const {result, rerender} = renderFieldErrors({fieldErrors: {merchant: 'iou.error.invalidMerchant'}, partiallyManuallyFilledScanID: 'txn2', onSwitchToTransaction});

        // When the confirm is blocked
        act(() => result.current.revealFieldErrors());

        // Then the receipt on screen stays, since validation only checks its values, and the summary asks to fix the error it shows
        expect(onSwitchToTransaction).not.toHaveBeenCalled();
        expect(result.current.footerErrorMessage).toBe('common.error.fixErrorsBeforeContinuing');

        // When the user fixes the merchant and confirms again
        rerender({fieldErrors: NO_FIELD_ERRORS, partiallyManuallyFilledScanID: 'txn2', onSwitchToTransaction});
        act(() => result.current.revealFieldErrors());

        // Then the partially filled sibling is brought on screen and the summary asks for its required fields
        expect(onSwitchToTransaction).toHaveBeenCalledWith('txn2');
        expect(result.current.footerErrorMessage).toBe('iou.error.enterRequiredFields');
    });

    it('stays on the receipt on screen when one of its own fields is missing', () => {
        // Given a multi-scan whose receipt on screen is missing its amount, while a sibling receipt is also partially filled
        const onSwitchToTransaction = jest.fn();
        const {result} = renderFieldErrors({fieldErrors: MISSING_AMOUNT, partiallyManuallyFilledScanID: 'txn2', onSwitchToTransaction});

        // When the confirm is blocked
        act(() => result.current.revealFieldErrors());

        // Then the user keeps the receipt they are on, which now shows its own errors
        expect(onSwitchToTransaction).not.toHaveBeenCalled();
        expect(result.current.visibleFieldErrors).toEqual(MISSING_AMOUNT);
    });

    it('keeps the summary while a sibling receipt of a multi-scan is still partially filled', () => {
        // Given a blocked confirm on a multi-scan whose partially filled receipt is not the one on screen
        const {result, rerender} = renderFieldErrors({fieldErrors: NO_FIELD_ERRORS, partiallyManuallyFilledScanID: 'txn2'});
        act(() => result.current.revealFieldErrors());

        // When the complete receipt is still the one on screen
        // Then the summary still explains why the confirm is blocked
        expect(result.current.footerErrorMessage).toBe('iou.error.enterRequiredFields');

        // When no receipt is partially filled any more
        rerender({fieldErrors: NO_FIELD_ERRORS, partiallyManuallyFilledScanID: undefined});

        // Then the summary goes away
        expect(result.current.footerErrorMessage).toBeUndefined();
    });
});
