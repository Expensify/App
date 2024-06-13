import React, {forwardRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import TextSelectorModal from './TextSelectorModal';
import type {TextPickerProps} from './types';

function TextPicker({value, description, placeholder = '', errorText = '', onInputChange, furtherDetails, rightLabel, ...rest}: TextPickerProps, forwardedRef: ForwardedRef<View>) {
    const styles = useThemeStyles();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (updatedValue: string) => {
        if (updatedValue !== value) {
            onInputChange?.(updatedValue);
        }
        hidePickerModal();
    };

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={value ?? placeholder ?? ''}
                description={description}
                onPress={showPickerModal}
                furtherDetails={furtherDetails}
                rightLabel={rightLabel}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                style={[styles.moneyRequestMenuItem]}
            />
            <TextSelectorModal
                value={value}
                isVisible={isPickerVisible}
                description={description}
                onClose={hidePickerModal}
                onValueSelected={updateInput}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </View>
    );
}

TextPicker.displayName = 'TextPicker';

export default forwardRef(TextPicker);
