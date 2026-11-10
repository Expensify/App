/**
 * Owns when the amount, date and merchant errors of the money request confirmation become visible, and the message
 * above its confirm button: a route error, then the summary while one of those errors blocks confirming, then the form error.
 */
import type {ConfirmationFieldErrors} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';
import {hasBlockingFieldErrors, NO_FIELD_ERRORS} from '@components/MoneyRequestConfirmationList/getConfirmationFieldErrors';

import useLocalize from '@hooks/useLocalize';

import {useState} from 'react';

type UseConfirmationFieldErrorsParams = {
    /** The errors the amount, date and merchant fields would show now, from `useConfirmationValidation` */
    fieldErrors: ConfirmationFieldErrors;

    /** ID of a partially filled Scan among the transactions being confirmed. Can name a receipt other than this one. */
    partiallyManuallyFilledScanID: string | undefined;

    /** Brings another receipt of a multi-scan on screen */
    onSwitchToTransaction: ((transactionID: string) => void) | undefined;

    /** The footer message `useFormErrorManagement` builds from the form error */
    formErrorMessage: string | undefined;

    /** An error loading the distance route, which the footer shows over the summary and the form error */
    routeError: string | null | undefined;
};

type UseConfirmationFieldErrorsResult = {
    /** The field errors to render. Empty until a confirm is blocked by one of them. */
    visibleFieldErrors: ConfirmationFieldErrors;

    /** The message above the confirm button: a route error, then the field errors summary while it applies, then the form error */
    footerErrorMessage: string | undefined;

    /** Shows the field errors after a confirm they blocked, bringing the receipt they belong to on screen */
    revealFieldErrors: () => void;
};

/** The errors themselves are derived from the transaction, so only the fact that a confirm was blocked is kept as state. */
function useConfirmationFieldErrors({
    fieldErrors,
    partiallyManuallyFilledScanID,
    onSwitchToTransaction,
    formErrorMessage,
    routeError,
}: UseConfirmationFieldErrorsParams): UseConfirmationFieldErrorsResult {
    const {translate} = useLocalize();
    const [shouldShowFieldErrors, setShouldShowFieldErrors] = useState(false);

    const hasFieldErrors = hasBlockingFieldErrors(fieldErrors, partiallyManuallyFilledScanID);

    // Hide the errors again once nothing is left to fix, so a field the user empties afterwards is only flagged on the next confirm.
    if (shouldShowFieldErrors && !hasFieldErrors) {
        setShouldShowFieldErrors(false);
    }

    // Validation only checks the values of the receipt on screen, so its errors are fixed first and a partially filled sibling only counts once it has none.
    const hasFieldErrorsOnScreen = Object.keys(fieldErrors).length > 0;
    const isRequiredFieldMissing = hasFieldErrorsOnScreen ? Object.values(fieldErrors).includes('common.error.fieldRequired') : !!partiallyManuallyFilledScanID;

    const revealFieldErrors = () => {
        setShouldShowFieldErrors(true);

        if (!hasFieldErrorsOnScreen && partiallyManuallyFilledScanID) {
            onSwitchToTransaction?.(partiallyManuallyFilledScanID);
        }
    };

    let footerErrorMessage = formErrorMessage;
    if (routeError) {
        footerErrorMessage = routeError;
    } else if (shouldShowFieldErrors && hasFieldErrors) {
        footerErrorMessage = translate(isRequiredFieldMissing ? 'iou.error.enterRequiredFields' : 'common.error.fixErrorsBeforeContinuing');
    }

    return {
        visibleFieldErrors: shouldShowFieldErrors ? fieldErrors : NO_FIELD_ERRORS,
        footerErrorMessage,
        revealFieldErrors,
    };
}

export default useConfirmationFieldErrors;
