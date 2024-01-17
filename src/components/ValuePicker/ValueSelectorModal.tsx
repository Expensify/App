import React, {useEffect, useState} from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {ValuePickerItem, ValueSelectorModalProps} from './types';

function ValueSelectorModal({items = [], selectedItem, label = '', isVisible, onClose, onItemSelected, shouldShowTooltips}: ValueSelectorModalProps) {
    const styles = useThemeStyles();
    const [sectionsData, setSectionsData] = useState<ValuePickerItem[]>([]);

    useEffect(() => {
        const itemsData = items.map((item, index) => ({
            value: item?.value,
            alternateText: item?.description,
            keyForList: item.value ?? '',
            text: item?.label ?? '',
            isSelected: item === selectedItem,
            sectionIndex: 0,
            index,
        }));
        setSectionsData(itemsData);
    }, [items, selectedItem]);

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            hideModalContentWhileAnimating
            useNativeDriver
        >
            <ScreenWrapper
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID="ValueSelectorModal"
            >
                <HeaderWithBackButton
                    title={label}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={[{data: sectionsData}]}
                    onSelectRow={onItemSelected}
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
