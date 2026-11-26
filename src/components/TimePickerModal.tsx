/**
 * The right docked time picker that time fields open. Kept apart from the field rows so each form can draw the field
 * the way it needs to while sharing the picker itself.
 */
import useThemeStyles from '@hooks/useThemeStyles';

import DateUtils from '@libs/DateUtils';

import CONST from '@src/CONST';

import React from 'react';

import Header from './Header';
import Modal from './Modal';
import ScreenWrapper from './ScreenWrapper';
import ScrollView from './ScrollView';
import TimePicker from './TimePicker/TimePicker';

type TimePickerModalProps = {
    isVisible: boolean;

    /** Title of the modal, the name of the field it edits */
    label: string;

    /** Date and time the field holds. The picked time is combined with its date. */
    value?: string;

    /** Called with the picked time combined with the date of `value` */
    onInputChange: (value: string) => void;

    /** Called when the modal is dismissed, including right after a time is picked */
    onClose: () => void;
};

function TimePickerModal({isVisible, label, value, onInputChange, onClose}: TimePickerModalProps) {
    const styles = useThemeStyles();

    const updateInput = (time: string) => {
        onInputChange(DateUtils.combineDateAndTime(time, value ?? ''));
        onClose();
    };

    return (
        <Modal
            type={CONST.MODAL.MODAL_TYPE.RIGHT_DOCKED}
            isVisible={isVisible}
            onClose={onClose}
            onModalHide={onClose}
            enableEdgeToEdgeBottomSafeAreaPadding
        >
            <ScreenWrapper
                style={styles.pb0}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom
                testID="TimeModalPicker"
            >
                <Header>
                    <Header.BackButton onPress={onClose} />
                    <Header.Title title={label} />
                </Header>
                <ScrollView
                    style={styles.flex1}
                    contentContainerStyle={styles.flexGrow1}
                >
                    <TimePicker
                        defaultValue={value}
                        onSubmit={updateInput}
                        shouldValidateFutureTime={false}
                    />
                </ScrollView>
            </ScreenWrapper>
        </Modal>
    );
}

export default TimePickerModal;
