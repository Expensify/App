import React, {useState} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import blurActiveElement from '@libs/Accessibility/blurActiveElement';
import CONST from '@src/CONST';
import callOrReturn from '@src/types/utils/callOrReturn';
import AmountSelectorModal from './AmountSelectorModal';
import type {AmountPickerProps} from './types';

function AmountPicker({value, description, title, errorText = '', onInputChange, furtherDetails, rightLabel, ref, ...rest}: AmountPickerProps) {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
        blurActiveElement();
    };

    const updateInput = (updatedValue: string) => {
        if (updatedValue !== value) {
            // We cast the updatedValue to a number and then back to a string to remove any leading zeros and separating commas
            onInputChange?.(String(Number(updatedValue)));
        }
        hidePickerModal();
    };

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon
                title={callOrReturn(title, value)}
                description={description}
                onPress={showPickerModal}
                furtherDetails={furtherDetails}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                rightLabel={rightLabel}
                errorText={errorText}
            />
            <AmountSelectorModal
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
                value={value}
                isVisible={isPickerVisible}
                description={description}
                onClose={hidePickerModal}
                onValueSelected={updateInput}
            />
        </View>
    );
}

export default AmountPicker;
