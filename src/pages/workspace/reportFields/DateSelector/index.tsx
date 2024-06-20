import React, {forwardRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {MenuItemBaseProps} from '@components/MenuItem';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import DateUtils from '@libs/DateUtils';
import DateSelectorModal from './DateSelectorModal';

type DateSelectorProps = Pick<MenuItemBaseProps, 'label' | 'rightLabel'> & {
    /** Function to call when the user selects a data */
    onInputChange?: (value: string) => void;

    /** Currently selected data */
    value?: string;
};

function DateSelector({value, label, onInputChange}: DateSelectorProps, forwardedRef: ForwardedRef<View>) {
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
                ref={forwardedRef}
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
                label={label ?? ''}
            />
        </View>
    );
}

DateSelector.displayName = 'DateSelector';

export default forwardRef(DateSelector);
