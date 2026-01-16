import mapValues from 'lodash/mapValues';
import React from 'react';
import type {StyleProp, TextStyle, ViewStyle} from 'react-native';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';
import type {ReceiptError, ReceiptErrors} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import MessagesRow from './MessagesRow';

type ErrorMessageRowProps = {
    /** The errors to display  */
    errors?: OnyxCommon.Errors | ReceiptErrors | OnyxCommon.TranslationKeyErrors | null;

    /** Additional style object for the error row */
    errorRowStyles?: StyleProp<ViewStyle>;

    /** Additional style object for the error row text */
    errorRowTextStyles?: StyleProp<TextStyle>;

    /** If passed, an X button next to the error will be shown and which triggers this callback */
    onDismiss?: () => void;

    /** A function to dismiss error */
    dismissError?: () => void;
};

function ErrorMessageRow({errors, errorRowStyles, onDismiss, dismissError, errorRowTextStyles}: ErrorMessageRowProps) {
    // Some errors have a null message. This is used to apply opacity only and to avoid showing redundant messages.
    const errorEntries = Object.entries(errors ?? {});
    const filteredErrorEntries = errorEntries.filter((errorEntry): errorEntry is [string, string | ReceiptError | OnyxCommon.TranslationKeyError] => errorEntry[1] !== null);
    const errorMessages = mapValues(Object.fromEntries(filteredErrorEntries), (error) => error);
    const hasErrorMessages = !isEmptyObject(errorMessages);

    return hasErrorMessages ? (
        <MessagesRow
            messages={errorMessages}
            type="error"
            onDismiss={onDismiss}
            containerStyles={errorRowStyles}
            errorTextStyles={errorRowTextStyles}
            dismissError={dismissError}
        />
    ) : null;
}

export default ErrorMessageRow;
