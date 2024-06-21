import React from 'react';
import {View} from 'react-native';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import type {ReportFieldItemType} from '@components/ReportFieldTypePicker';
import ReportFieldTypePicker from '@components/ReportFieldTypePicker';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {PolicyReportFieldType} from '@src/types/onyx/Policy';

type TypeSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected type */
    currentType: PolicyReportFieldType;

    /** Label to display on field */
    label: string;

    /** Subtitle to display on field */
    subtitle: string;

    /** Function to call when the user selects a type */
    onTypeSelected: (value: ReportFieldItemType) => void;

    /** Function to call when the user closes the type selector modal */
    onClose: () => void;
};

function TypeSelectorModal({isVisible, currentType, label, subtitle, onTypeSelected, onClose}: TypeSelectorModalProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();

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
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={StyleUtils.combineStyles([styles.sidebarLinkText, styles.optionAlternateText, styles.pre])}>{subtitle}</Text>
                </View>
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
