import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import SelectionList from '@components/SelectionList';
import RadioListItem from '@components/SelectionList/RadioListItem';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PolicyCategoryExpenseLimitType} from '@src/types/onyx/PolicyCategory';

type ExpenseLimitTypeSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected expense limit type  */
    currentExpenseLimitType: PolicyCategoryExpenseLimitType;

    /** Function to call when the user selects an expense limit type */
    onExpenseLimitTypeSelected: (value: PolicyCategoryExpenseLimitType) => void;

    /** Function to call when the user closes the expense limit type selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function ExpenseLimitTypeSelectorModal({isVisible, currentExpenseLimitType, onExpenseLimitTypeSelected, onClose, label}: ExpenseLimitTypeSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const expenseLimitTypes = Object.values(CONST.POLICY.EXPENSE_LIMIT_TYPES).map((value) => ({
        value,
        text: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}`),
        alternateText: translate(`workspace.rules.categoryRules.expenseLimitTypes.${value}Subtitle`),
        keyForList: value,
        isSelected: currentExpenseLimitType === value,
    }));

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
                testID={ExpenseLimitTypeSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <SelectionList
                    sections={[{data: expenseLimitTypes}]}
                    ListItem={RadioListItem}
                    onSelectRow={(item) => onExpenseLimitTypeSelected(item.value)}
                    shouldSingleExecuteRowSelect
                    containerStyle={[styles.pt3]}
                    initiallyFocusedOptionKey={currentExpenseLimitType}
                    isAlternateTextMultilineSupported
                    alternateTextNumberOfLines={3}
                />
            </ScreenWrapper>
        </Modal>
    );
}

ExpenseLimitTypeSelectorModal.displayName = 'ExpenseLimitTypeSelectorModal';

export default ExpenseLimitTypeSelectorModal;
