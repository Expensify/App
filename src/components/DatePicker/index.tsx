import {setYear} from 'date-fns';
import React, {forwardRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import CalendarPicker from './CalendarPicker';

type DatePickerProps = {
    /**
     * The datepicker supports any value that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    value?: string;

    /**
     * The datepicker supports any defaultValue that `new Date()` can parse.
     * `onInputChange` would always be called with a Date (or null)
     */
    defaultValue?: string;

    inputID: string;

    /** A minimum date of calendar to select */
    minDate?: Date;

    /** A maximum date of calendar to select */
    maxDate?: Date;

    /** A function that is passed by FormWrapper */
    onInputChange: (value: Date) => void;

    /** A function that is passed by FormWrapper */
    onTouched: () => void;
} & BaseTextInputProps;

function DatePicker(
    {
        containerStyles,
        defaultValue,
        disabled,
        errorText,
        inputID,
        label,
        maxDate = setYear(new Date(), CONST.CALENDAR_PICKER.MAX_YEAR),
        minDate = setYear(new Date(), CONST.CALENDAR_PICKER.MIN_YEAR),
        onInputChange,
        onTouched,
        placeholder,
        value,
    }: DatePickerProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);
    const {isSmallScreenWidth} = useWindowDimensions();

    const onSelected = (newValue: string) => {
        onTouched?.();
        onInputChange?.(newValue);
        setSelectedDate(newValue);
    };

    return (
        <View style={styles.datePickerRoot}>
            <View style={[isSmallScreenWidth ? styles.flex2 : {}, styles.pointerEventsNone]}>
                <TextInput
                    ref={ref}
                    inputID={inputID}
                    forceActiveLabel
                    icon={Expensicons.Calendar}
                    label={label}
                    accessibilityLabel={label}
                    role={CONST.ROLE.PRESENTATION}
                    value={selectedDate}
                    placeholder={placeholder ?? translate('common.dateFormat')}
                    errorText={errorText}
                    containerStyles={containerStyles}
                    textInputContainerStyles={[styles.borderColorFocus]}
                    inputStyle={[styles.pointerEventsNone]}
                    disabled={disabled}
                    readOnly
                />
            </View>
            <View style={[styles.datePickerPopover, styles.border]}>
                <CalendarPicker
                    minDate={minDate}
                    maxDate={maxDate}
                    value={selectedDate}
                    onSelected={onSelected}
                />
            </View>
        </View>
    );
}

DatePicker.displayName = 'DatePicker';

export default forwardRef(DatePicker);
