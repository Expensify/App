import HeaderWithBackButton from '@components/HeaderWithBackButton';
import MenuItemWithTopDescription from '@components/MenuItemWithTopDescription';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import MultiSelectListItem from '@components/SelectionList/ListItem/MultiSelectListItem';
import type {ListItem} from '@components/SelectionList/ListItem/types';

import useLocalize from '@hooks/useLocalize';

import CONST from '@src/CONST';

import React, {useState} from 'react';

type MultiSelectPushRowAdapterProps = {
    items: Array<{value: string; label: string}>;

    /** Selected option keys supplied by the FormProvider */
    value?: string[];

    /** Callback to update the selection in the FormProvider */
    onInputChange?: (value: string[]) => void;

    errorText?: string;

    /** Field label shown above the selected values on the row */
    description: string;

    modalHeaderTitle: string;

    /** Callback to call when the picker modal is dismissed */
    onBlur?: () => void;
};

function MultiSelectPushRowAdapter({items, value, onInputChange = () => {}, errorText, description, modalHeaderTitle, onBlur = () => {}}: MultiSelectPushRowAdapterProps) {
    const {translate} = useLocalize();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [pendingSelection, setPendingSelection] = useState<string[]>([]);
    const selected = Array.isArray(value) ? value : [];
    const title = items
        .filter((item) => selected.includes(item.value))
        .map((item) => item.label)
        .join(', ');

    const openModal = () => {
        setPendingSelection(selected);
        setIsModalVisible(true);
    };

    const closeModal = () => {
        setIsModalVisible(false);
        onBlur();
    };

    const toggle = (item: ListItem) => {
        setPendingSelection((previous) => (previous.includes(item.keyForList) ? previous.filter((key) => key !== item.keyForList) : [...previous, item.keyForList]));
    };

    const confirm = () => {
        onInputChange(pendingSelection);
        closeModal();
    };

    const data: ListItem[] = items.map((item) => ({keyForList: item.value, text: item.label, isSelected: pendingSelection.includes(item.value)}));

    return (
        <>
            <MenuItemWithTopDescription
                shouldShowRightIcon
                title={title}
                description={description}
                onPress={openModal}
                brickRoadIndicator={errorText ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : undefined}
                errorText={errorText}
            />
            <Modal
                onClose={closeModal}
                isVisible={isModalVisible}
                type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
                shouldUseCustomBackdrop
                shouldHandleNavigationBack
            >
                <ScreenWrapper
                    includePaddingTop={false}
                    includeSafeAreaPaddingBottom={false}
                    testID="MultiSelectPushRowModal"
                >
                    <HeaderWithBackButton
                        title={modalHeaderTitle}
                        onBackButtonPress={closeModal}
                    />
                    <SelectionList
                        canSelectMultiple
                        data={data}
                        ListItem={MultiSelectListItem}
                        onSelectRow={toggle}
                        onSelectionButtonPress={toggle}
                        shouldShowTextInput={false}
                        confirmButtonOptions={{showButton: true, text: translate('common.save'), onConfirm: confirm}}
                    />
                </ScreenWrapper>
            </Modal>
        </>
    );
}

export default MultiSelectPushRowAdapter;
