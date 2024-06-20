import React, {useRef} from 'react';
import {View} from 'react-native';
import DatePicker from '@components/DatePicker';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import type {AnimatedTextInputRef} from '@components/RNTextInput';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
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
    const {translate} = useLocalize();
    const inputRef = useRef<AnimatedTextInputRef>(null);

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
                        inputID={INPUT_IDS.INITIAL_VALUE}
                        defaultValue={currentDate}
                        maxDate={CONST.CALENDAR_PICKER.MAX_DATE}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        accessibilityLabel={translate('workspace.editor.initialValueInputLabel')}
                        onInputChange={onDateSelected}
                        ref={inputRef}
                    />
                </View>
            </ScreenWrapper>
        </Modal>
    );
}

DateSelectorModal.displayName = 'DateSelectorModal';

export default DateSelectorModal;
