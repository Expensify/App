import React, {useState} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Navigation from '@libs/Navigation/Navigation';
import CONST from '@src/CONST';
import type {ValuePickerItem, ValuePickerProps} from './types';
import ValueSelectionList from './ValueSelectionList';
import ValueSelectorModal from './ValueSelectorModal';

function ValuePicker({
    value,
    label,
    items,
    placeholder = '',
    errorText = '',
    onInputChange,
    furtherDetails,
    shouldShowTooltips = true,
    shouldShowModal = true,
    ref,
    forwardedFSClass,
}: ValuePickerProps) {
    const [isPickerVisible, setIsPickerVisible] = useState(false);

    const showPickerModal = () => {
        setIsPickerVisible(true);
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

    const selectedItem = items?.find((item) => item.value === value);

    return (
        <View>
            {shouldShowModal ? (
                <>
                    <MenuItemWithTopDescription
                        ref={ref}
                        shouldShowRightIcon
                        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                        title={selectedItem?.label || placeholder || ''}
                        description={label}
                        onPress={showPickerModal}
                        furtherDetails={furtherDetails}
                        brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={errorText}
                        forwardedFSClass={forwardedFSClass}
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
                        shouldEnableKeyboardAvoidingView={false}
                    />
                </>
            ) : (
                <ValueSelectionList
                    items={items}
                    selectedItem={selectedItem}
                    onItemSelected={updateInput}
                    shouldShowTooltips={shouldShowTooltips}
                />
            )}
        </View>
    );
}

export default ValuePicker;
