import React from 'react';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/AssignCardForm';

type TransactionStartDateSelectorModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** The date to display in the date picker */
    date: string;

    /** Function to call when the user selects a date */
    handleSelectDate: (date: string) => void;

    /** Function to call when the user closes the type selector modal */
    onClose: () => void;
};

function TransactionStartDateSelectorModal({isVisible, date, handleSelectDate, onClose}: TransactionStartDateSelectorModalProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ASSIGN_CARD_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.ASSIGN_CARD_FORM> =>
        ValidationUtils.getFieldRequiredErrors(values, [INPUT_IDS.START_DATE]);

    const submit = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.ASSIGN_CARD_FORM>) => {
        handleSelectDate(values[INPUT_IDS.START_DATE]);
        onClose();
    };

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
                testID={TransactionStartDateSelectorModal.displayName}
            >
                <HeaderWithBackButton
                    title={translate('common.date')}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.ASSIGN_CARD_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={submit}
                    style={[styles.flex1, styles.mh5]}
                    enabledWhenOffline
                    validate={validate}
                    submitButtonStyles={[styles.mb0, styles.pb0, styles.mh0]}
                >
                    <InputWrapper
                        InputComponent={DatePicker}
                        inputID={INPUT_IDS.START_DATE}
                        minDate={CONST.CALENDAR_PICKER.MIN_DATE}
                        maxDate={new Date()}
                        defaultValue={date}
                    />
                </FormProvider>
            </ScreenWrapper>
        </Modal>
    );
}

TransactionStartDateSelectorModal.displayName = 'TransactionStartDateSelectorModal';

export default TransactionStartDateSelectorModal;
