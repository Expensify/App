import FormHelpMessage from '@components/FormHelpMessage';
import MenuItem from '@components/MenuItem';
import MenuItemField from '@components/MenuItem/presets/MenuItemField';

import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import {callFunctionIfActionIsAllowed} from '@userActions/Session';

import CONST from '@src/CONST';

import type {StyleProp, ViewStyle} from 'react-native';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {BusinessTypeItemType, IncorporationType} from './types';

import BusinessTypeSelectorModal from './BusinessTypeSelectorModal';

type BusinessTypePickerProps = {
    errorText?: string;

    /** Business type to display */
    value?: string;

    /** Callback to call when the input changes */
    onInputChange?: (value: string) => void;

    label: string;
    wrapperStyle: StyleProp<ViewStyle>;

    /**  Callback to call when the picker modal is dismissed */
    onBlur?: () => void;
};

function BusinessTypePicker({errorText = '', value = '', wrapperStyle, onInputChange, label, onBlur}: BusinessTypePickerProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
    };

    const hidePickerModal = (shouldBlur = true) => {
        if (onBlur && shouldBlur) {
            onBlur();
        }
        setIsPickerVisible(false);
    };

    const updateBusinessTypeInput = (businessTypeItem: BusinessTypeItemType) => {
        if (onInputChange && businessTypeItem.value !== value) {
            onInputChange(businessTypeItem.value);
        }
        // If the user selects any business type, call the hidePickerModal function with shouldBlur = false
        // to prevent the onBlur function from being called.
        hidePickerModal(false);
    };

    const title = value ? translate(`businessInfoStep.incorporationType.${value as IncorporationType}`) : '';

    return (
        <View style={wrapperStyle}>
            <MenuItem.Root onPress={callFunctionIfActionIsAllowed(showPickerModal)}>
                <MenuItemField.Row
                    name={label}
                    value={title}
                >
                    {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                    <MenuItem.Chevron />
                </MenuItemField.Row>
                {!!errorText && (
                    <FormHelpMessage
                        isError
                        shouldShowRedDotIndicator={false}
                        message={errorText}
                        style={styles.menuItemError}
                    />
                )}
            </MenuItem.Root>
            <BusinessTypeSelectorModal
                isVisible={isPickerVisible}
                currentBusinessType={value}
                onClose={hidePickerModal}
                onBusinessTypeSelected={updateBusinessTypeInput}
                label={label}
            />
        </View>
    );
}

export default BusinessTypePicker;
