import React, {forwardRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import FormHelpMessage from '@components/FormHelpMessage';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import TextSelectorModal from './TextSelectorModal';
import type {TextPickerProps} from './types';

function TextPicker({value, description, placeholder = '', errorText = '', onInputChange, furtherDetails, rightLabel, ...rest}: TextPickerProps, forwardedRef: ForwardedRef<View>) {
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
                style={[styles.moneyRequestMenuItem]}
            />
            <View style={styles.ml5}>
                <FormHelpMessage message={errorText} />
            </View>
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
