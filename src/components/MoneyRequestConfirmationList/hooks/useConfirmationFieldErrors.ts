/**
 * Owns when the amount, date and merchant errors of the money request confirmation become visible, and which of those
 * fields a blocked confirm brings into view.
 */
import type {ConfirmationField, ConfirmationFieldErrors, SiblingFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import {hasBlockingFieldErrors, hasFieldErrors, NO_FIELD_ERRORS} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';

import {useState} from 'react';

/** The order the fields appear in on every confirmation, so the first one flagged is the first one the user reaches */
const FIELDS_IN_SCREEN_ORDER: ConfirmationField[] = ['amount', 'merchant', 'date'];

type UseConfirmationFieldErrorsParams = {
    /** The receipt on screen */
    transactionID: string | undefined;

    /** The errors the amount, date and merchant fields would show now, from `useConfirmationValidation` */
    fieldErrors: ConfirmationFieldErrors;

    /** The first other receipt of a multi-scan with a field error, from `useConfirmationValidation` */
    siblingFieldErrors: SiblingFieldErrors | undefined;

    /** Brings another receipt of a multi-scan on screen */
    onSwitchToTransaction: ((transactionID: string) => void) | undefined;

    /** Scrolls the given field of the given receipt into view */
    onRevealField: (field: ConfirmationField, transactionID: string | undefined) => void;
};

type UseConfirmationFieldErrorsResult = {
    /** The field errors to render. Empty until a confirm is blocked by one of them. */
    visibleFieldErrors: ConfirmationFieldErrors;

    /** Shows the field errors after a confirm they blocked, bringing the receipt and the field they belong to into view */
    revealFieldErrors: () => void;
};

/** The errors themselves are derived from the transaction, so only the fact that a confirm was blocked is kept as state. */
function useConfirmationFieldErrors({
    transactionID,
    fieldErrors,
    siblingFieldErrors,
    onSwitchToTransaction,
    onRevealField,
}: UseConfirmationFieldErrorsParams): UseConfirmationFieldErrorsResult {
    const [shouldShowFieldErrors, setShouldShowFieldErrors] = useState(false);

    // Hide the errors again once nothing is left to fix, so a field the user empties afterwards is only flagged on the next confirm.
    if (shouldShowFieldErrors && !hasBlockingFieldErrors(fieldErrors, siblingFieldErrors)) {
        setShouldShowFieldErrors(false);
    }

    const revealFieldErrors = () => {
        setShouldShowFieldErrors(true);

        // The receipt on screen is fixed first, so another receipt is only brought on screen once this one has nothing left to fix.
        const hasFieldErrorsOnScreen = hasFieldErrors(fieldErrors);
        if (!hasFieldErrorsOnScreen && siblingFieldErrors) {
            onSwitchToTransaction?.(siblingFieldErrors.transactionID);
        }

        const blockingReceipt = hasFieldErrorsOnScreen ? {transactionID, fieldErrors} : siblingFieldErrors;
        const firstFlaggedField = FIELDS_IN_SCREEN_ORDER.find((field) => !!blockingReceipt?.fieldErrors[field]);
        if (firstFlaggedField) {
            onRevealField(firstFlaggedField, blockingReceipt?.transactionID);
        }
    };

    return {
        visibleFieldErrors: shouldShowFieldErrors ? fieldErrors : NO_FIELD_ERRORS,
        revealFieldErrors,
    };
}

export default useConfirmationFieldErrors;
