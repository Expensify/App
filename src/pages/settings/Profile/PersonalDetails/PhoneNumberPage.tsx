import {Str} from 'expensify-common';
import React, {useCallback, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import DelegateNoAccessModal from '@components/DelegateNoAccessModal';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import FullscreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import ScreenWrapper from '@components/ScreenWrapper';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import * as PhoneNumberUtils from '@libs/PhoneNumber';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as PersonalDetails from '@userActions/PersonalDetails';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalDetailsForm';
import type {PrivatePersonalDetails} from '@src/types/onyx';

function PhoneNumberPage() {
    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS);
    const [isLoadingApp] = useOnyx(ONYXKEYS.IS_LOADING_APP, {initialValue: true});
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const phoneNumber = privatePersonalDetails?.phoneNumber ?? '';

    const validateLoginError = ErrorUtils.getEarliestErrorField(privatePersonalDetails, 'phoneNumber');
    const currenPhoneNumber = privatePersonalDetails?.phoneNumber ?? '';

    // const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    // const isActingAsDelegate = !!account?.delegatedAccess?.delegate;
    const [isActingAsDelegate] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.delegatedAccess?.delegate});
    const [isNoDelegateAccessMenuVisible, setIsNoDelegateAccessMenuVisible] = useState(false);

    const updatePhoneNumber = (values: PrivatePersonalDetails) => {
        // Clear the error when the user tries to submit the form
        if (validateLoginError) {
            PersonalDetails.clearPhoneNumberError();
        }

        // Only call the API if the user has changed their phone number
        if (phoneNumber !== values?.phoneNumber) {
            PersonalDetails.updatePhoneNumber(values?.phoneNumber ?? '', currenPhoneNumber);
        }

        Navigation.goBack();
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> => {
            const errors: FormInputErrors<typeof ONYXKEYS.FORMS.PERSONAL_DETAILS_FORM> = {};
            if (!ValidationUtils.isRequiredFulfilled(values[INPUT_IDS.PHONE_NUMBER])) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('common.error.fieldRequired');
            }
            const phoneNumberWithCountryCode = LoginUtils.appendCountryCode(values[INPUT_IDS.PHONE_NUMBER]);
            const parsedPhoneNumber = PhoneNumberUtils.parsePhoneNumber(phoneNumberWithCountryCode);
            if (!parsedPhoneNumber.possible || !Str.isValidE164Phone(phoneNumberWithCountryCode.slice(0))) {
                errors[INPUT_IDS.PHONE_NUMBER] = translate('bankAccount.error.phoneNumber');
            }

            // Clear the error when the user tries to validate the form and there are errors
            if (validateLoginError && !!errors) {
                PersonalDetails.clearPhoneNumberError();
            }
            return errors;
        },
        [translate, validateLoginError],
    );
    // For delegates, modifying Phone Number is a restricted action.
    // So, on pressing submit, skip validation and show delegateNoAccessModal
    const skipValidation = isActingAsDelegate;
    const handleSubmit = (values: PrivatePersonalDetails) => {
        if (isActingAsDelegate) {
            setIsNoDelegateAccessMenuVisible(true);
            return;
        }
        updatePhoneNumber(values);
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={false}
            shouldEnableMaxHeight
            testID={PhoneNumberPage.displayName}
        >
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
                    validate={skipValidation ? undefined : validate}
                    onSubmit={handleSubmit}
                    submitButtonText={translate('common.save')}
                    enabledWhenOffline
                >
                    <OfflineWithFeedback
                        errors={validateLoginError}
                        errorRowStyles={styles.mt2}
                        onClose={() => PersonalDetails.clearPhoneNumberError()}
                    >
                        <InputWrapper
                            InputComponent={TextInput}
                            inputID={INPUT_IDS.PHONE_NUMBER}
                            name="lfname"
                            label={translate('common.phoneNumber')}
                            aria-label={translate('common.phoneNumber')}
                            role={CONST.ROLE.PRESENTATION}
                            defaultValue={phoneNumber}
                            spellCheck={false}
                            onBlur={() => {
                                if (!validateLoginError) {
                                    return;
                                }
                                PersonalDetails.clearPhoneNumberError();
                            }}
                        />
                    </OfflineWithFeedback>
                </FormProvider>
            )}
            <DelegateNoAccessModal
                isNoDelegateAccessMenuVisible={isNoDelegateAccessMenuVisible}
                onClose={() => setIsNoDelegateAccessMenuVisible(false)}
            />
        </ScreenWrapper>
    );
}

PhoneNumberPage.displayName = 'PhoneNumberPage';

export default PhoneNumberPage;
