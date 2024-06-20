import React from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WorkspaceReportFieldsForm';

type DateSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Selected date */
    currentDate: string;

    /** Function to call when the user selects a date */
    onDateSelected: (date: Date | string) => void;

    /** Function to call when the user closes the date selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;
};

function DateSelectorModal({isVisible, currentDate, onDateSelected, onClose, label}: DateSelectorModalProps) {
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
                testID={DateSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />

                <View style={[styles.ph5]}>
                    <DatePicker
                        formID={ONYXKEYS.FORMS.WORKSPACE_REPORT_FIELDS_FORM}
                        inputID={INPUT_IDS.INITIAL_VALUE}
                        defaultValue={currentDate ?? ''}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        onInputChange={onDateSelected}
                    />
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

DateSelectorModal.displayName = 'DateSelectorModal';

export default DateSelectorModal;
