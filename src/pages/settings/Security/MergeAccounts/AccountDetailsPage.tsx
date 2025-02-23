import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import FixedFooter from '@components/FixedFooter';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import FormAlertWithSubmitButton from '@components/FormAlertWithSubmitButton';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import {addErrorMessage, getLatestErrorMessage} from '@libs/ErrorUtils';
import {appendCountryCode, getPhoneNumberWithoutSpecialChars} from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import {isNumericWithSpecialChars} from '@libs/ValidationUtils';
import {requestValidationCodeForAccountMerge} from '@userActions/MergeAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MergeAccountDetailsForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

const getErrorKey = (err: string): ValueOf<typeof CONST.MERGE_ACCOUNT_RESULTS> | null => {
    if (err.includes('404')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_NO_EXIST;
    }

    if (err.includes('401')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_PRIMARY_LOGIN;
    }

    if (err.includes('402')) {
        return CONST.MERGE_ACCOUNT_RESULTS.ERR_SAML_NOT_SUPPORTED;
    }

    return null;
};

function AccountDetailsPage() {
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [getValidateCodeForAccountMerge] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.getValidateCodeForAccountMerge});
    const [form] = useOnyx(ONYXKEYS.FORMS.MERGE_ACCOUNT_DETAILS_FORM_DRAFT);
    const email = form?.[INPUT_IDS.PHONE_OR_EMAIL] ?? '';

    const validateCodeSent = getValidateCodeForAccountMerge?.validateCodeSent;
    const latestError = getLatestErrorMessage(getValidateCodeForAccountMerge);
    const errorKey = getErrorKey(latestError);
    const genericError = !errorKey ? latestError : undefined;

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (!validateCodeSent || !email) {
            return;
        }

        return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE.getRoute(email));
    }, [validateCodeSent, email]);

    useEffect(() => {
        if (!errorKey || !email) {
            return;
        }
        return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(email, errorKey));
    }, [errorKey, email]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERGE_ACCOUNT_DETAILS_FORM>): Errors => {
        const errors = {};

        const login = values[INPUT_IDS.PHONE_OR_EMAIL];

        if (!login) {
            addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('common.pleaseEnterEmailOrPhoneNumber'));
        } else {
            const phoneLogin = appendCountryCode(getPhoneNumberWithoutSpecialChars(login));
            const parsedPhoneNumber = parsePhoneNumber(phoneLogin);

            if (!Str.isValidEmail(login) && !parsedPhoneNumber.possible) {
                if (isNumericWithSpecialChars(login)) {
                    addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('common.error.phoneNumber'));
                } else {
                    addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('loginForm.error.invalidFormatEmailLogin'));
                }
            }
        }

        if (!values[INPUT_IDS.CONSENT]) {
            addErrorMessage(errors, INPUT_IDS.CONSENT, translate('common.error.fieldRequired'));
        }
        return errors;
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={AccountDetailsPage.displayName}
        >
            <HeaderWithBackButton
                title={translate('mergeAccountsPage.mergeAccount')}
                onBackButtonPress={() => Navigation.goBack()}
            />
            <FormProvider
                formID={ONYXKEYS.FORMS.MERGE_ACCOUNT_DETAILS_FORM}
                onSubmit={(values) => {
                    requestValidationCodeForAccountMerge(values[INPUT_IDS.PHONE_OR_EMAIL]);
                }}
                style={[styles.flexGrow1, styles.mh5]}
                shouldTrimValues
                validate={validate}
                submitButtonText={translate('common.next')}
                isSubmitButtonVisible={false}
            >
                <View style={[styles.flexGrow1]}>
                    <Text style={[styles.mt5]}>{translate('mergeAccountsPage.accountDetails.accountToMergeInto', {email: userEmailOrPhone ?? ''})}</Text>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={INPUT_IDS.PHONE_OR_EMAIL}
                        autoCapitalize="none"
                        label={translate('loginForm.phoneOrEmail')}
                        aria-label={translate('loginForm.phoneOrEmail')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt5]}
                        autoCorrect={false}
                        shouldSaveDraft
                    />
                    <InputWrapper
                        style={[styles.mt6]}
                        InputComponent={CheckboxWithLabel}
                        inputID={INPUT_IDS.CONSENT}
                        label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')}
                        aria-label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')}
                    />
                </View>
                <FixedFooter style={[styles.ph0, styles.pb0]}>
                    <FormAlertWithSubmitButton
                        isAlertVisible={!!genericError}
                        onSubmit={() => {
                            requestValidationCodeForAccountMerge(email);
                        }}
                        message={genericError}
                        buttonText={translate('common.next')}
                        enabledWhenOffline={false}
                        containerStyles={styles.mt3}
                        isLoading={getValidateCodeForAccountMerge?.isLoading}
                    />
                </FixedFooter>
            </FormProvider>
        </ScreenWrapper>
    );
}

AccountDetailsPage.displayName = 'AccountDetailsPage';

export default AccountDetailsPage;
