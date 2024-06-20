import React from 'react';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import type {ReportFieldItemType} from '@components/ReportFieldTypePicker';
import ReportFieldTypePicker from '@components/ReportFieldTypePicker';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

type TypeSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected type */
    currentType: PolicyReportFieldType;

    /** Function to call when the user selects a type */
    onTypeSelected: (value: ReportFieldItemType) => void;

    /** Function to call when the user closes the type selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function TypeSelectorModal({isVisible, currentType, onTypeSelected, onClose, label}: TypeSelectorModalProps) {
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
                testID={TypeSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <ReportFieldTypePicker
                    defaultValue={currentType}
                    onOptionSelected={onTypeSelected}
                />
            </ScreenWrapper>
        </Modal>
    );
}

TypeSelectorModal.displayName = 'TypeSelectorModal';

export default TypeSelectorModal;
