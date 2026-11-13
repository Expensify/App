/**
 * The date of a saved expense, picked in place on the expense view. A pick is saved right away, through the same write
 * the date page uses.
 */
import DatePicker from '@components/DatePicker';

import type {DuplicateTransactionsAndViolations} from '@hooks/useDuplicateTransactionsAndViolations';
import type {MoneyRequestUpdateParams} from '@hooks/useMoneyRequestUpdateParams';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionDate from '@hooks/useUpdateTransactionDate';

import {getFormattedCreated} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React, {useState} from 'react';
import {View} from 'react-native';

type DateInputFieldProps = {
    /** Expense whose date is edited */
    transaction: OnyxEntry<OnyxTypes.Transaction>;

    /** What a save needs to recompute the expense's violations, read once by the expense view */
    updateParams: MoneyRequestUpdateParams;

    /** The expense's duplicates, whose violations a save can change, read once by the expense view */
    duplicates: DuplicateTransactionsAndViolations;

    /** Whether the expense is tracked rather than reported */
    isTrackExpense: boolean;

    /** Label of the picker, which can carry extra detail such as the posted date */
    label: string;

    /** Violation message for the date */
    errorText?: string;
};

function DateInputField({transaction, updateParams, duplicates, isTrackExpense, label, errorText = ''}: DateInputFieldProps) {
    const styles = useThemeStyles();
    const {updateDate} = useUpdateTransactionDate({transaction, updateParams, duplicates, isTrackExpense});
    const savedDate = getFormattedCreated(transaction);
    const [isCleared, setIsCleared] = useState(false);

    const saveDate = (newDate: string) => {
        // An expense always has a date, so clearing only empties the picker until the next pick.
        setIsCleared(!newDate);
        if (!newDate || newDate === savedDate) {
            return;
        }
        updateDate(newDate);
    };

    return (
        // `DatePicker` carries the vertical margin every field has, so this only adds the side margins.
        <View style={styles.mh4}>
            <DatePicker
                inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                value={isCleared ? '' : savedDate}
                label={label}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                onInputChange={saveDate}
                errorText={errorText}
                shouldDeferShowUntilPositioned
                clearButtonSentryLabel={CONST.SENTRY_LABEL.MONEY_REQUEST_VIEW.DATE_FIELD_CLEAR_BUTTON}
                onPickerVisibilityChange={(isVisible) => {
                    // Closing the calendar without a pick brings the saved date back.
                    if (isVisible || !isCleared) {
                        return;
                    }
                    setIsCleared(false);
                }}
            />
        </View>
    );
}

export default DateInputField;
