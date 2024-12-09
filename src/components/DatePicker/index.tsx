import {setYear} from 'date-fns';
import type {ForwardedRef} from 'react';
import React, {forwardRef, useEffect, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import TextInput from '@components/TextInput';
import type {BaseTextInputProps, BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import * as FormActions from '@userActions/FormActions';
import CONST from '@src/CONST';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
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
    onInputChange?: (value: string) => void;

    /** A function that is passed by FormWrapper */
    onTouched?: () => void;

    /** Saves a draft of the input value when used in a form */
    shouldSaveDraft?: boolean;

    /** ID of the wrapping form */
    formID?: keyof OnyxFormValuesMapping;
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
        shouldSaveDraft = false,
        formID,
    }: DatePickerProps,
    ref: ForwardedRef<BaseTextInputRef>,
) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const [selectedDate, setSelectedDate] = useState(value || defaultValue || undefined);
    const {shouldUseNarrowLayout} = useResponsiveLayout();

    const onSelected = (newValue: string) => {
        onTouched?.();
        onInputChange?.(newValue);
        setSelectedDate(newValue);
    };

    useEffect(() => {
        // Value is provided to input via props and onChange never fires. We have to save draft manually.
        if (shouldSaveDraft && !!formID) {
            FormActions.setDraftValues(formID, {[inputID]: selectedDate});
        }

        if (selectedDate === value || !value) {
            return;
        }

        setSelectedDate(value);
    }, [formID, inputID, selectedDate, shouldSaveDraft, value]);

    return (
        <View style={styles.datePickerRoot}>
            <View style={[shouldUseNarrowLayout ? styles.flex2 : {}, styles.pointerEventsNone]}>
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
            <View
                style={[styles.datePickerPopover, styles.border]}
                collapsable={false}
            >
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
