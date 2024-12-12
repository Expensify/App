import mapValues from 'lodash/mapValues';
import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {ReceiptError, ReceiptErrors} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MessagesRow from './MessagesRow';

type ErrorMessageRowProps = {
    /** The errors to display  */
    errors?: OnyxCommon.Errors | ReceiptErrors | null;

    /** Additional style object for the error row */
    errorRowStyles?: StyleProp<ViewStyle>;

    /** A function to run when the X button next to the error is clicked */
    onClose?: () => void;

    /** Whether we can dismiss the error message */
    canDismissError?: boolean;
};

function ErrorMessageRow({errors, errorRowStyles, onClose, canDismissError = true}: ErrorMessageRowProps) {
    // Some errors have a null message. This is used to apply opacity only and to avoid showing redundant messages.
    const errorEntries = Object.entries(errors ?? {});
    const filteredErrorEntries = errorEntries.filter((errorEntry): errorEntry is [string, string | ReceiptError] => errorEntry[1] !== null);
    const errorMessages = mapValues(Object.fromEntries(filteredErrorEntries), (error) => error);
    const hasErrorMessages = !isEmptyObject(errorMessages);

    return hasErrorMessages ? (
        <MessagesRow
            messages={errorMessages}
            type="error"
            onClose={onClose}
            containerStyles={errorRowStyles}
            canDismiss={canDismissError}
        />
    ) : null;
}

ErrorMessageRow.displayName = 'ErrorMessageRow';

export default ErrorMessageRow;
