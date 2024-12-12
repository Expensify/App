import React from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ReportFieldsInitialListValuePicker from './ReportFieldsInitialListValuePicker';

type InitialListValueSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected value */
    currentValue: string;

    /** Label to display on field */
    label: string;

    /** Subtitle to display on field */
    subtitle: string;

    /** Function to call when the user selects a value */
    onValueSelected: (value: string) => void;

    /** Function to call when the user closes the value selector modal */
    onClose: () => void;
};

function InitialListValueSelectorModal({isVisible, currentValue, label, subtitle, onValueSelected, onClose}: InitialListValueSelectorModalProps) {
    const styles = useThemeStyles();

    const [formDraft] = useOnyx(ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT);

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
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={InitialListValueSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <View style={[styles.ph5, styles.pb4]}>
                    <Text style={[styles.sidebarLinkText, styles.optionAlternateText]}>{subtitle}</Text>
                </View>
                <ReportFieldsInitialListValuePicker
                    listValues={formDraft?.listValues ?? []}
                    disabledOptions={formDraft?.disabledListValues ?? []}
                    value={currentValue}
                    onValueChange={onValueSelected}
                />
            </ScreenWrapper>
        </Modal>
    );
}

InitialListValueSelectorModal.displayName = 'InitialListValueSelectorModal';

export default InitialListValueSelectorModal;
