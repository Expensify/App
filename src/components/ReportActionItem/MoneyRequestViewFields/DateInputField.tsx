/**
 * The date of a saved expense, picked in place on the expense view. A pick is saved right away, through the same write
 * the date page uses.
 */
import DatePicker from '@components/DatePicker';

import type {DuplicateTransactionsAndViolations} from '@hooks/useDuplicateTransactionsAndViolations';
import type {MoneyRequestUpdateParams} from '@hooks/useMoneyRequestUpdateParams';
import useThemeStyles from '@hooks/useThemeStyles';
import useUpdateTransactionDate from '@hooks/useUpdateTransactionDate';

import {getCreated, getFormattedCreated} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import INPUT_IDS from '@src/types/form/MoneyRequestDateForm';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

import React from 'react';
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

    const saveDate = (newDate: string) => {
        // The stored value can include a time from SmartScan, so picking the day that is already shown still saves the
        // date without that time, which can clear a futureDate violation, the same as the date page.
        if (!newDate || newDate === getCreated(transaction)) {
            return;
        }
        updateDate(newDate);
    };

    return (
        // `DatePicker` carries the vertical margin every field has, so this only adds the side margins.
        <View style={styles.mh4}>
            <DatePicker
                inputID={INPUT_IDS.MONEY_REQUEST_CREATED}
                value={savedDate}
                label={label}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                onInputChange={saveDate}
                errorText={errorText}
                shouldDeferShowUntilPositioned
                // An expense always has a date, so there is nothing to clear.
                shouldHideClearButton
            />
        </View>
    );
}

export default DateInputField;
