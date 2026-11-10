import useLocalize from '@hooks/useLocalize';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import type {ComponentRef, ForwardedRef} from 'react';
import type {View} from 'react-native';

import React, {useState} from 'react';

import MenuItemWithTopDescription from './MenuItemWithTopDescription';
import TimePickerModal from './TimePickerModal';

type TimeModalPickerProps = {
    value?: string;

    /** Callback when the list item is selected */
    onInputChange?: (value: string, key?: string) => void;

    /** Form Error description */
    errorText?: string;

    label: string;
    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

function TimeModalPicker({value, errorText, label, onInputChange = () => {}, ref}: TimeModalPickerProps) {
    const {dateFnsLocale} = useLocalize();
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    // The row shows a localized time, while `TimePicker` still reads `value` through `extractTime12Hour` — that one is
    // the picker's English wire format, so rendering it here would put an AM/PM clock next to 24-hour times elsewhere.
    const currentTime = value ? DateUtils.formatToLocalTime(value, dateFnsLocale) : undefined;

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={currentTime}
                description={label}
                onPress={() => setIsPickerVisible(true)}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                ref={ref}
            />
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

export default TimeModalPicker;
