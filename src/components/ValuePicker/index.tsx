import MenuItem from '@components/MenuItem';
import Text from '@components/Text';

import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';

import Navigation from '@libs/Navigation/Navigation';

import {callIfAuthenticated} from '@userActions/Session';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {authTokenTypeSelector} from '@selectors/Session';
import React, {useState} from 'react';
import {View} from 'react-native';

import type {ValuePickerItem, ValuePickerProps} from './types';

import ValueSelectionList from './ValueSelectionList';
import ValueSelectorModal from './ValueSelectorModal';

function ValuePicker({
    value,
    label = '',
    modalHeaderTitle,
    shouldReadErrorWithLabel,
    items,
    placeholder = '',
    errorText = '',
    onInputChange,
    onOpen,
    furtherDetails,
    shouldShowTooltips = true,
    shouldShowModal = true,
    ref,
    forwardedFSClass,
    addBottomSafeAreaPadding = true,
    disableKeyboardShortcuts = false,
    alternateNumberOfSupportedLines,
    disabled = false,
}: ValuePickerProps) {
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [session] = useOnyx(ONYXKEYS.SESSION, {selector: authTokenTypeSelector});
    const styles = useThemeStyles();

    const showPickerModal = () => {
        setIsPickerVisible(true);
        onOpen?.();
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
    const title = selectedItem?.label || placeholder || '';

    return (
        <View>
            {shouldShowModal ? (
                <>
                    <MenuItem.Root
                        ref={ref}
                        onPress={callIfAuthenticated(showPickerModal, session)}
                        isDisabled={disabled}
                        sentryLabel={CONST.SENTRY_LABEL.VALUE_PICKER.OPEN}
                        forwardedFSClass={forwardedFSClass}
                    >
                        <MenuItem.Row>
                            <MenuItem.Content>
                                {title ? (
                                    <>
                                        <MenuItem.FieldName>{label}</MenuItem.FieldName>
                                        <MenuItem.FieldValue forwardedFSClass={forwardedFSClass}>{title}</MenuItem.FieldValue>
                                    </>
                                ) : (
                                    <MenuItem.FieldNamePlaceholder>{label}</MenuItem.FieldNamePlaceholder>
                                )}
                                {!!furtherDetails && (
                                    <Text
                                        style={styles.textLabelSupporting}
                                        numberOfLines={2}
                                    >
                                        {furtherDetails}
                                    </Text>
                                )}
                            </MenuItem.Content>
                            <MenuItem.Trailing>
                                {!!errorText && <MenuItem.BrickRoadIndicator status={CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR} />}
                                <MenuItem.Chevron />
                            </MenuItem.Trailing>
                        </MenuItem.Row>
                        {!!errorText && (
                            <MenuItem.HelpText
                                isError
                                message={errorText}
                                shouldReadErrorWithLabel={shouldReadErrorWithLabel}
                            />
                        )}
                    </MenuItem.Root>
                    <ValueSelectorModal
                        isVisible={isPickerVisible}
                        label={modalHeaderTitle ?? label}
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
