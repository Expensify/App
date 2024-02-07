import React, {useMemo} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ValueSelectorModalProps} from './types';

function ValueSelectorModal({items = [], selectedItem, label = '', isVisible, onClose, onItemSelected, shouldShowTooltips = true}: ValueSelectorModalProps) {
    const styles = useThemeStyles();

    const sectionsData = useMemo(() => [{data: items.map((item) => ({...item, isSelected: item === selectedItem, keyForList: item.value ?? ''}))}], [items, selectedItem]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={() => onClose?.()}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="ValueSelectorModal"
            >
                <HeaderWithBackButton
                    title={label}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={sectionsData}
                    onSelectRow={(item) => onItemSelected?.(item)}
                    initiallyFocusedOptionKey={selectedItem?.value}
                    shouldStopPropagation
                    shouldShowTooltips={shouldShowTooltips}
                />
            </ScreenWrapper>
        </Modal>
    );
}

ValueSelectorModal.displayName = 'ValueSelectorModal';

export default ValueSelectorModal;
