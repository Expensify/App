import React from 'react';
import AmountForm from '@components/AmountForm';
import FormProvider from '@components/Form/FormProvider';
import InputWrapperWithRef from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import Modal from '@components/Modal';
import ScreenWrapper from '@components/ScreenWrapper';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as CurrencyUtils from '@libs/CurrencyUtils';
import getPermittedDecimalSeparator from '@libs/getPermittedDecimalSeparator';
import * as MoneyRequestUtils from '@libs/MoneyRequestUtils';
import * as NumberUtils from '@libs/NumberUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PolicyDistanceRateEditForm';

type RateModalProps = {
    /** Whether the modal is visible */
    isVisible: boolean;

    /** Current rate value */
    currentRate?: string;

    /** Function to call when the user submits new rate */
    onRateSubmit: (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>) => void;

    /** Function to call when the user closes the category selector modal */
    onClose: () => void;

    /** Label to display on field */
    label: string;

    /** Currency to display next to rate */
    currency: string;
};

function RateModal({isVisible, currentRate = '', onRateSubmit, onClose, label, currency}: RateModalProps) {
    const styles = useThemeStyles();
    const {translate, toLocaleDigit} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM> => {
        const errors: FormInputErrors<typeof ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM> = {};
        const rate = values.rate;
        const parsedRate = MoneyRequestUtils.replaceAllDigits(rate, toLocaleDigit);
        const decimalSeparator = toLocaleDigit('.');
        // Allow one more decimal place for accuracy
        const rateValueRegex = RegExp(String.raw`^-?\d{0,8}([${getPermittedDecimalSeparator(decimalSeparator)}]\d{1,${CurrencyUtils.getCurrencyDecimals(currency) + 1}})?$`, 'i');
        if (!rateValueRegex.test(parsedRate) || parsedRate === '') {
            errors.rate = 'workspace.reimburse.invalidRateError';
        } else if (NumberUtils.parseFloatAnyLocale(parsedRate) <= 0) {
            errors.rate = 'workspace.reimburse.lowRateError';
        }
        return errors;
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
                style={[styles.pb0]}
                includePaddingTop={false}
                includeSafeAreaPaddingBottom={false}
                testID={RateModal.displayName}
            >
                <HeaderWithBackButton
                    title={label}
                    shouldShowBackButton
                    onBackButtonPress={onClose}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM}
                    submitButtonText={translate('common.save')}
                    onSubmit={onRateSubmit}
                    validate={validate}
                    enabledWhenOffline
                    style={[styles.flexGrow1]}
                    shouldHideFixErrorsAlert
                    submitFlexEnabled={false}
                    submitButtonStyles={[styles.mh5, styles.mt0]}
                >
                    <InputWrapperWithRef
                        InputComponent={AmountForm}
                        inputID={INPUT_IDS.RATE}
                        extraDecimals={1}
                        defaultValue={(parseFloat(currentRate) / CONST.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(3)}
                        isCurrencyPressable={false}
                        currency={currency}
                        ref={inputCallbackRef}
                    />
                </FormProvider>
            </ScreenWrapper>
        </Modal>
    );
}

RateModal.displayName = 'RateModal';

export default RateModal;
