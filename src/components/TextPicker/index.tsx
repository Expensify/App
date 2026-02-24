import React, {useState} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import TextSelectorModal from './TextSelectorModal';
import type {TextPickerProps} from './types';

function TextPicker({
    value,
    description,
    placeholder = '',
    errorText = '',
    onInputChange,
    onValueCommitted,
    furtherDetails,
    rightLabel,
    disabled = false,
    interactive = true,
    required = false,
    customValidate,
    wrapperStyle,
    numberOfLinesTitle,
    titleStyle,
    descriptionTextStyle,
    ref,
    ...rest
}: TextPickerProps) {
    const styles = useThemeStyles();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        if (disabled) {
            return;
        }
        setIsPickerVisible(true);
    };

    const hidePickerModal = () => {
        // Fixes the issue where the keyboard would open and close again after dismissing the modal on Android
        KeyboardUtils.dismissKeyboardAndExecute(() => {
            setIsPickerVisible(false);
        });
    };

    const updateInput = (updatedValue: string) => {
        if (updatedValue !== value) {
            onInputChange?.(updatedValue);
        }
        onValueCommitted?.(updatedValue);
        hidePickerModal();
    };

    return (
        <View>
            <MenuItemWithTopDescription
                ref={ref}
                shouldShowRightIcon={!disabled}
                title={value ?? placeholder ?? ''}
                description={description}
                onPress={showPickerModal}
                furtherDetails={furtherDetails}
                rightLabel={rightLabel}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
                style={[styles.moneyRequestMenuItem]}
                interactive={interactive}
                wrapperStyle={wrapperStyle}
                numberOfLinesTitle={numberOfLinesTitle}
                titleStyle={titleStyle}
                descriptionTextStyle={descriptionTextStyle}
            />
            <TextSelectorModal
                value={value}
                isVisible={isPickerVisible}
                description={description}
                onClose={hidePickerModal}
                onValueSelected={updateInput}
                disabled={disabled}
                required={required}
                customValidate={customValidate}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...rest}
            />
        </View>
    );
}

export default TextPicker;
