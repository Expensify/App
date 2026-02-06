import React, {useCallback} from 'react';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useAutoFocusInput from '@hooks/useAutoFocusInput';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {getEarliestErrorField} from '@libs/ErrorUtils';
import {appendCountryCode, formatE164PhoneNumber} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {isRequiredFulfilled, isValidPhoneNumber} from '@libs/ValidationUtils';
import {clearPhoneNumberError, updatePhoneNumber as updatePhone} from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';

function PhoneNumberPage() {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP, {canBeMissing: true});
    const [countryCode = CONST.DEFAULT_COUNTRY_CODE] = useOnyx(ONYXKEYS.COUNTRY_CODE, {canBeMissing: false});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {inputCallbackRef} = useAutoFocusInput();
    const phoneNumber = privatePersonalDetails?.phoneNumber ?? '';

    const validateLoginError = getEarliestErrorField(privatePersonalDetails, 'phoneNumber');
    const currenPhoneNumber = privatePersonalDetails?.phoneNumber ?? '';

    const updatePhoneNumber = (values: PrivatePersonalDetails) => {
        // Clear the error when the user tries to submit the form
        if (validateLoginError) {
            clearPhoneNumberError();
        }

        // Only call the API if the user has changed their phone number
        if (values?.phoneNumber && phoneNumber !== values.phoneNumber) {
            updatePhone(formatE164PhoneNumber(values.phoneNumber, countryCode) ?? '', currenPhoneNumber);
        }

        Navigation.goBack();
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            const phoneNumberValue = values[INPUT_IDS.PHONE_NUMBER];

            if (!isRequiredFulfilled(phoneNumberValue)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
                return errors;
            }

            const phoneNumberWithCountryCode = appendCountryCode(phoneNumberValue, countryCode);

            if (!isValidPhoneNumber(phoneNumberWithCountryCode)) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.phoneNumber');
                return errors;
            }

            if (validateLoginError && Object.keys(errors).length > 0) {
                clearPhoneNumberError();
            }

            return errors;
        },
        [translate, validateLoginError, countryCode],
    );

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            shouldEnableMaxHeight
            testID="PhoneNumberPage"
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('common.phoneNumber')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                {isLoadingApp ? (
                    <FullscreenLoadingIndicator style={[styles.flex1, styles.pRelative]} />
                ) : (
                    <FormProvider
                        style={[styles.flexGrow1, styles.ph5]}
                        formID={ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM}
                        validate={validate}
                        onSubmit={updatePhoneNumber}
                        submitButtonText={translate('common.save')}
                        enabledWhenOffline
                        shouldHideFixErrorsAlert
                    >
                        <OfflineWithFeedback
                            errors={validateLoginError}
                            errorRowStyles={styles.mt2}
                            onClose={() => clearPhoneNumberError()}
                        >
                            <InputWrapper
                                InputComponent={TextInput}
                                ref={inputCallbackRef}
                                inputID={INPUT_IDS.PHONE_NUMBER}
                                name="phoneNumber"
                                label={translate('common.phoneNumber')}
                                aria-label={translate('common.phoneNumber')}
                                role={CONST.ROLE.PRESENTATION}
                                defaultValue={phoneNumber}
                                spellCheck={false}
                                inputMode={CONST.INPUT_MODE.TEL}
                                onBlur={() => {
                                    if (!validateLoginError) {
                                        return;
                                    }
                                    clearPhoneNumberError();
                                }}
                            />
                        </OfflineWithFeedback>
                    </FormProvider>
                )}
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

export default PhoneNumberPage;
