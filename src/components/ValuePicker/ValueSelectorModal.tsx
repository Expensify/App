import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import CONST from '@src/CONST';
import type {ValueSelectorModalProps} from './types';
import ValueSelectionList from './ValueSelectionList';

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
    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            onBackdropPress={onBackdropPress}
            shouldHandleNavigationBack
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                includePaddingTop={false}
                enableEdgeToEdgeBottomSafeAreaPadding
                testID="ValueSelectorModal"
                shouldEnableKeyboardAvoidingView={shouldEnableKeyboardAvoidingView}
            >
                <HeaderWithBackButton
                    title={label}
                    onBackButtonPress={onClose}
                />
                <ValueSelectionList
                    items={items}
                    selectedItem={selectedItem}
                    onItemSelected={onItemSelected}
                    shouldShowTooltips={shouldShowTooltips}
                />
            </ScreenWrapper>
        </Modal>
    );
}

export default ValueSelectorModal;
