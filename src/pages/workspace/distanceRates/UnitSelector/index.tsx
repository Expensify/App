import Str from 'expensify-common/lib/str';
import React, {useMemo, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import type {UnitItemType} from '@components/UnitPicker';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';
import type {Unit} from '@src/types/onyx/Policy';
import UnitSelectorModal from './UnitSelectorModal';

type UnitSelectorProps = {
    /** Function to call when the user selects a unit */
    setNewUnit: (value: UnitItemType) => void;

    /** Currently selected unit */
    defaultValue: Unit;

    /** Label to display on field */
    label: string;

    /** Any additional styles to apply */
    wrapperStyle: StyleProp<ViewStyle>;
};

function UnitSelector({defaultValue, wrapperStyle, label, setNewUnit}: UnitSelectorProps) {
    const {translate} = useLocalize();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateUnitInput = (unit: UnitItemType) => {
        setNewUnit(unit);
        hidePickerModal();
    };

    const unitTranslations = useMemo(
        () => ({
            [CONST.CUSTOM_UNITS.DISTANCE_UNIT_KILOMETERS]: translate('common.kilometers'),
            [CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES]: translate('common.miles'),
        }),
        [translate],
    );

    return (
        <View>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={Str.recapitalize(unitTranslations[defaultValue])}
                description={label}
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
