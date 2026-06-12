import React, {useState} from 'react';
import {View} from 'react-native';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import useIsCenteredRHPModal from '@libs/Navigation/AppNavigator/useIsCenteredRHPModal';
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
    addBottomSafeAreaPadding = true,
    disableKeyboardShortcuts = false,
    alternateNumberOfSupportedLines,
    onRequestOpenInline,
}: ValuePickerProps) {
    const isCenteredModal = useIsCenteredRHPModal();
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

    // Inside a centered RHP modal, render the selection list inline via the parent step instead of opening a second modal.
    const shouldRenderInline = isCenteredModal && !!onRequestOpenInline;

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
                        onPress={() => (shouldRenderInline ? onRequestOpenInline?.({label, items, selectedItem, onItemSelected: updateInput, shouldShowTooltips}) : showPickerModal())}
                        furtherDetails={furtherDetails}
                        brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                        errorText={errorText}
                        forwardedFSClass={forwardedFSClass}
                    />
                    {!shouldRenderInline && (
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
                            addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                            alternateNumberOfSupportedLines={alternateNumberOfSupportedLines}
                        />
                    )}
                </>
            ) : (
                <ValueSelectionList
                    items={items}
                    selectedItem={selectedItem}
                    onItemSelected={updateInput}
                    shouldShowTooltips={shouldShowTooltips}
                    addBottomSafeAreaPadding={addBottomSafeAreaPadding}
                    disableKeyboardShortcuts={disableKeyboardShortcuts}
                    alternateNumberOfSupportedLines={alternateNumberOfSupportedLines}
                />
            )}
        </View>
    );
}

export default ValuePicker;
