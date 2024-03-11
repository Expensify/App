import React, {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type CategoryItemType from './types';

type CategorySelectorModalProps = {
    /** Collection of categories attached to a policy */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected category  */
    currentCategory: string;

    /** Function to call when the user selects a category */
    onCategorySelected: (value: CategoryItemType) => void;

    /** Function to call when the user closes the category selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function CategorySelectorModal({policyCategories, isVisible, currentCategory, onCategorySelected, onClose, label}: CategorySelectorModalProps) {
    const styles = useThemeStyles();

    const categories = useMemo(
        () =>
            Object.values(policyCategories ?? {}).map((value) => ({
                value: value.name,
                text: value.name,
                keyForList: value.name,
                isSelected: value.name === currentCategory,
            })),
        [currentCategory, policyCategories],
    );

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
                <SelectionList
                    ListItem={RadioListItem}
                    sections={[{data: categories, indexOffset: 0}]}
                    initiallyFocusedOptionKey={currentCategory}
                    onSelectRow={onCategorySelected}
                    shouldStopPropagation
                    shouldUseDynamicMaxToRenderPerBatch
                />
            </ScreenWrapper>
        </Modal>
    );
}

CategorySelectorModal.displayName = 'CategorySelectorModal';

export default CategorySelectorModal;
