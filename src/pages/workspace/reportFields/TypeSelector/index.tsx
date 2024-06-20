import {Str} from 'expensify-common';
import React, {useState} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {ReportFieldItemType} from '@components/ReportFieldTypePicker';
// import useLocalize from '@hooks/useLocalize';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';
import TypeSelectorModal from './TypeSelectorModal';

type TypeSelectorProps = {
    /** Function to call when the user selects a type */
    onInputChange?: (value: string) => void;

    /** Currently selected type */
    value?: string;

    /** Label to display on field */
    label: string;
};

function TypeSelector({value, label, onInputChange: setNewType}: TypeSelectorProps) {
    // const {translate} = useLocalize();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateTypeInput = (reportField: ReportFieldItemType) => {
        setNewType?.(reportField.value);
        hidePickerModal();
    };

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                // TODO: Add translation here
                title={Str.recapitalize(value ?? '')}
                description={label}
                onPress={showPickerModal}
            />
            <TypeSelectorModal
                isVisible={isPickerVisible}
                currentType={value as PolicyReportFieldType}
                onClose={hidePickerModal}
                onTypeSelected={updateTypeInput}
                label={label}
            />
        </View>
    );
}

TypeSelector.displayName = 'TypeSelector';

export default TypeSelector;
