import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ValueSelectorModalProps} from './types';

function ValueSelectorModal({
    items = [],
    selectedItem,
    label = '',
    isVisible,
    onClose,
    onItemSelected,
    shouldShowTooltips = true,
    onBackdropPress,
    shouldEnableKeyboardAvoidingView = true,
}: ValueSelectorModalProps) {
    const styles = useThemeStyles();

    const sections = useMemo(
        () => [{data: items.map((item) => ({value: item.value, alternateText: item.description, text: item.label ?? '', isSelected: item === selectedItem, keyForList: item.value ?? ''}))}],
        [items, selectedItem],
    );

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
            onBackdropPress={onBackdropPress}
        >
            <ScreenWrapper
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom
                testID={ValueSelectorModal.displayName}
                shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            >
                <HeaderWithBackButton
                    title={label}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={sections}
                    onSelectRow={(item) => onItemSelected?.(item)}
                    initiallyFocusedOptionKey={selectedItem?.value}
                    shouldStopPropagation
                    shouldShowTooltips={shouldShowTooltips}
                    ListItem={RadioListItem}
                />
            </ScreenWrapper>
        </Modal>
    );
}

ValueSelectorModal.displayName = 'ValueSelectorModal';

export default ValueSelectorModal;
