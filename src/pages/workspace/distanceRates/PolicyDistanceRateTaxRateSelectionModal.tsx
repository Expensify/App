import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import CONST from '@src/CONST';

type ListItemType = {
    value: string;
    text: string;
    isSelected: boolean;
    keyForList: string;
};

type PolicyDistanceRateTaxRateSelectionModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The list of items to render */
    items: ListItemType[];

    /** Function to call when the user selects a role */
    onTaxRateChange: ({value}: ListItemType) => void;

    /** Function to call when the user closes the role selection modal */
    onClose: () => void;
};

function PolicyDistanceRateTaxRateSelectionModal({isVisible, items, onTaxRateChange, onClose = () => {}}: PolicyDistanceRateTaxRateSelectionModalProps) {
    const {translate} = useLocalize();

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
                testID={PolicyDistanceRateTaxRateSelectionModal.displayName}
                includePaddingTop={false}
            >
                <HeaderWithBackButton
                    title={translate('workspace.taxes.taxRate')}
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={[{data: items}]}
                    ListItem={RadioListItem}
                    onSelectRow={onTaxRateChange}
                    initiallyFocusedOptionKey={items.find((item) => item.isSelected)?.keyForList}
                />
            </ScreenWrapper>
        </Modal>
    );
}

PolicyDistanceRateTaxRateSelectionModal.displayName = 'PolicyDistanceRateTaxRateSelectionModal';

export type {ListItemType};

export default PolicyDistanceRateTaxRateSelectionModal;
