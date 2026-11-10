import ExpenseFieldRow from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldRow';
import TimePickerModal from '@components/TimePickerModal';

import useLocalize from '@hooks/useLocalize';

import DateUtils from '@libs/DateUtils';

import type {WithRequiredSentryLabel} from '@src/types/utils/SentryLabel';

import type {ComponentRef, ForwardedRef} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

type PerDiemTimeFieldProps = WithRequiredSentryLabel & {
    /** Date and time the field holds */
    value?: string;

    /** Called with the picked time, combined with the date of `value` */
    onInputChange?: (value: string, key?: string) => void;

    /** Form error shown below the field */
    errorText?: string;

    /** Name of the field */
    label: string;

    /** Forwarded by the form to focus the field when it has an error */
    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

/**
 * A time field on the per diem time page. It is drawn as a bordered field so it lines up with the date inputs it sits
 * between, unlike the menu row `TimeModalPicker` uses on other forms.
 */
function PerDiemTimeField({value, errorText, label, onInputChange = () => {}, ref, sentryLabel}: PerDiemTimeFieldProps) {
    const {dateFnsLocale} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    // The row shows a localized time, while `TimePicker` still reads `value` through `extractTime12Hour` — that one is
    // the picker's English wire format, so rendering it here would put an AM/PM clock next to 24-hour times elsewhere.
    const currentTime = value ? DateUtils.formatToLocalTime(value, dateFnsLocale) : undefined;

    return (
        <>
            <View ref={ref}>
                <ExpenseFieldRow
                    name={label}
                    value={currentTime}
                    onPress={() => setIsPickerVisible(true)}
                    errorText={errorText}
                    sentryLabel={sentryLabel}
                />
            </View>
            <TimePickerModal
                isVisible={isPickerVisible}
                label={label}
                value={value}
                onInputChange={onInputChange}
                onClose={() => setIsPickerVisible(false)}
            />
        </>
    );
}

export default PerDiemTimeField;
