import React from 'react';
import CategoryPicker from '@components/CategoryPicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import type {ListItem} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';

type CategorySelectorModalProps = {
    /** The ID of the associated policy */
    policyID: string;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected category  */
    currentCategory: string;

    /** Function to call when the user selects a category */
    onCategorySelected: (value: ListItem) => void;

    /** Function to call when the user closes the category selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function CategorySelectorModal({policyID, isVisible, currentCategory, onCategorySelected, onClose, label}: CategorySelectorModalProps) {
    const styles = useThemeStyles();

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
                testID={CategorySelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <CategoryPicker
                    policyID={policyID}
                    selectedCategory={currentCategory}
                    onSubmit={onCategorySelected}
                />
            </ScreenWrapper>
        </Modal>
    );
}

CategorySelectorModal.displayName = 'CategorySelectorModal';

export default CategorySelectorModal;
