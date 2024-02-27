import React, {forwardRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import AmountSelectorModal from './AmountSelectorModal';
import type {AmountPickerProps} from './types';

function AmountPicker(
    {value, description, placeholder = '', errorText = '', onInputChange, furtherDetails, shouldShowTooltips = true, rightLabel}: AmountPickerProps,
    forwardedRef: ForwardedRef<View>,
) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
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

    const descStyle = !value || value.length === 0 ? StyleUtils.getFontSizeStyle(variables.fontSizeLabel) : null;

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                title={value ?? placeholder ?? ''}
                descriptionTextStyle={descStyle}
                description={description}
                onPress={showPickerModal}
                furtherDetails={furtherDetails}
                rightLabel={rightLabel}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
            <AmountSelectorModal
                isVisible={isPickerVisible}
                description={description}
                onClose={hidePickerModal}
                onValueSelected={updateInput}
                shouldShowTooltips={shouldShowTooltips}
            />
        </View>
    );
}

AmountPicker.displayName = 'AmountPicker';

export default forwardRef(AmountPicker);
