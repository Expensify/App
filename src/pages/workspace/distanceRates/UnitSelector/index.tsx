import React, {useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import type {UnitItemType, UnitType} from './types';
import UnitSelectorModal from './UnitSelectorModal';

type UnitSelectorProps = {
    /** Function to call when the user selects a unit */
    setNewUnit: (value: UnitItemType) => void;

    /** Currently selected unit */
    defaultValue: string;

    /** Label to display on field */
    label: string;

    /** Any additional styles to apply */
    wrapperStyle: StyleProp<ViewStyle>;
};

function UnitSelector({defaultValue = '', wrapperStyle, label, setNewUnit}: UnitSelectorProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateUnitInput = (UnitItem: UnitItemType) => {
        setNewUnit(UnitItem);
        hidePickerModal();
    };

    const title = defaultValue ? translate(`workspace.distanceRates.units.${defaultValue as UnitType}`) : '';
    const descStyle = title.length === 0 ? styles.textNormal : null;

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={title}
                description={label}
                descriptionTextStyle={descStyle}
                onPress={showPickerModal}
                wrapperStyle={wrapperStyle}
            />
            <UnitSelectorModal
                isVisible={isPickerVisible}
                currentUnit={defaultValue}
                onClose={hidePickerModal}
                onUnitSelected={updateUnitInput}
                label={label}
            />
        </View>
    );
}

UnitSelector.displayName = 'UnitSelector';

export default UnitSelector;
