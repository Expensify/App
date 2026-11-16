/** Compact range fields for filter panes that cannot fit two full calendars. */
import DatePicker from '@components/DatePicker';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import {max, min} from 'date-fns';
import React, {useId} from 'react';
import {View} from 'react-native';

import type {RangeDatePickerProps} from './RangeDatePicker';

type RangeDateInputsProps = Omit<RangeDatePickerProps, 'forceVertical'>;

function RangeDateInputs({fromValue, toValue, onFromSelected, onToSelected}: RangeDateInputsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const inputID = useId();
    const fromDate = DateUtils.parseCalendarDate(fromValue);
    const toDate = DateUtils.parseCalendarDate(toValue);

    return (
        <View style={styles.mh5}>
            <DatePicker
                inputID={`${inputID}-from`}
                label={translate('common.from')}
                value={fromValue ?? ''}
                defaultValue={toValue}
                minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                maxDate={toDate ? min([toDate, CONST.CALENDAR_PICKER.MAX_DATE]) : CONST.CALENDAR_PICKER.MAX_DATE}
                onInputChange={onFromSelected}
                clearButtonSentryLabel={CONST.SENTRY_LABEL.DATE_FILTER.RANGE_FROM_CLEAR_BUTTON}
                shouldDeferShowUntilPositioned
            />
            <DatePicker
                inputID={`${inputID}-to`}
                label={translate('common.to')}
                value={toValue ?? ''}
                defaultValue={fromValue}
                minDate={fromDate ? max([fromDate, CONST.CALENDAR_PICKER.MIN_DATE]) : CONST.CALENDAR_PICKER.MIN_DATE}
                maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                onInputChange={onToSelected}
                clearButtonSentryLabel={CONST.SENTRY_LABEL.DATE_FILTER.RANGE_TO_CLEAR_BUTTON}
                shouldDeferShowUntilPositioned
            />
        </View>
    );
}

export default RangeDateInputs;
