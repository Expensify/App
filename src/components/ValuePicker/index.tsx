import React, {forwardRef, useState} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useStyleUtils from '@hooks/useStyleUtils';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import KeyboardUtils from '@src/utils/keyboard';
import type {ValuePickerItem, ValuePickerProps} from './types';
import ValueSelectorModal from './ValueSelectorModal';

function ValuePicker({value, label, items, placeholder = '', errorText = '', onInputChange, furtherDetails, shouldShowTooltips = true}: ValuePickerProps, forwardedRef: ForwardedRef<View>) {
    const StyleUtils = useStyleUtils();
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        KeyboardUtils.dismiss().then(() => {
            setIsPickerVisible(true);
        });
    };

    const hidePickerModal = () => {
        setIsPickerVisible(false);
    };

    const updateInput = (item: ValuePickerItem) => {
        if (item.value !== value) {
            onInputChange?.(item.value);
        }
        hidePickerModal();
    };

    const descStyle = !value || value.length === 0 ? StyleUtils.getFontSizeStyle(variables.fontSizeLabel) : null;
    const selectedItem = items?.find((item) => item.value === value);

    return (
        <View>
            <MenuItemWithTopDescription
                ref={forwardedRef}
                shouldShowRightIcon
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                title={selectedItem?.label || placeholder || ''}
                descriptionTextStyle={descStyle}
                description={label}
                onPress={showPickerModal}
                furtherDetails={furtherDetails}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <ValueSelectorModal
                isVisible={isPickerVisible}
                label={label}
                selectedItem={selectedItem}
                items={items}
                onClose={hidePickerModal}
                onItemSelected={updateInput}
                shouldShowTooltips={shouldShowTooltips}
                onBackdropPress={Navigation.dismissModal}
            />
        </View>
    );
}

ValuePicker.displayName = 'ValuePicker';

export default forwardRef(ValuePicker);
