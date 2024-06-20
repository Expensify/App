import React, {useState} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import DateUtils from '@libs/DateUtils';
import DateSelectorModal from './DateSelectorModal';

type DateSelectorProps = {
    /** Function to call when the user selects a data */
    onInputChange?: (value: string) => void;

    /** Currently selected data */
    value?: string;

    /** Label to display on field */
    label: string;
};

function DateSelector({value, label, onInputChange}: DateSelectorProps) {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateDateInput = (date: Date | string) => {
        onInputChange?.(date as string);
        hidePickerModal();
    };

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={DateUtils.extractDate(value ?? '')}
                description={label}
                onPress={showPickerModal}
            />
            <DateSelectorModal
                isVisible={isPickerVisible}
                currentDate={value ?? ''}
                onClose={hidePickerModal}
                onDateSelected={updateDateInput}
                label={label}
            />
        </View>
    );
}

DateSelector.displayName = 'DateSelector';

export default DateSelector;
