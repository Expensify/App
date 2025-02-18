import {Str} from 'expensify-common';
import React, {useEffect} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import CheckboxWithLabel from '@components/CheckboxWithLabel';
import DelegateNoAccessWrapper from '@components/DelegateNoAccessWrapper';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormOnyxValues} from '@components/Form/types';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import * as LoginUtils from '@libs/LoginUtils';
import Navigation from '@libs/Navigation/Navigation';
import {parsePhoneNumber} from '@libs/PhoneNumber';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as MergeAccounts from '@userActions/MergeAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/MergeAccountDetailsForm';
import type {Errors} from '@src/types/onyx/OnyxCommon';

function AccountDetailsPage() {
    const [userEmailOrPhone] = useOnyx(ONYXKEYS.SESSION, {selector: (session) => session?.email});
    const [mergeAccountData] = useOnyx(ONYXKEYS.ACCOUNT, {selector: (account) => account?.mergeAccount});

    const styles = useThemeStyles();
    const {translate} = useLocalize();

    useEffect(() => {
        if (mergeAccountData?.getValidateCodeForAccountMerge?.isLoading) {
            return;
        }

        if (mergeAccountData?.getValidateCodeForAccountMerge?.validateCodeSent) {
            return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE.getRoute(mergeAccountData?.email ?? ''));
        }

        if (mergeAccountData?.getValidateCodeForAccountMerge?.errors) {
            return Navigation.navigate(ROUTES.SETTINGS_MERGE_ACCOUNTS_RESULT.getRoute(mergeAccountData?.email ?? '', 'error'));
        }
    }, [mergeAccountData]);

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.MERGE_ACCOUNT_DETAILS_FORM>): Errors => {
        const errors = {};

        const login = values[INPUT_IDS.PHONE_OR_EMAIL];

        if (!login) {
            ErrorUtils.addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('common.pleaseEnterEmailOrPhoneNumber'));
        } else {
            const phoneLogin = LoginUtils.appendCountryCode(LoginUtils.getPhoneNumberWithoutSpecialChars(login));
            const parsedPhoneNumber = parsePhoneNumber(phoneLogin);

            if (!Str.isValidEmail(login) && !parsedPhoneNumber.possible) {
                if (ValidationUtils.isNumericWithSpecialChars(login)) {
                    ErrorUtils.addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('common.error.phoneNumber'));
                } else {
                    ErrorUtils.addErrorMessage(errors, INPUT_IDS.PHONE_OR_EMAIL, translate('loginForm.error.invalidFormatEmailLogin'));
                }
            }
        }

        if (!values[INPUT_IDS.CONSENT]) {
            ErrorUtils.addErrorMessage(errors, INPUT_IDS.CONSENT, translate('common.error.fieldRequired'));
        }
        return errors;
    };

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom
            testID={AccountDetailsPage.displayName}
        >
            <DelegateNoAccessWrapper accessDeniedVariants={[CONST.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton
                    title={translate('mergeAccountsPage.mergeAccount')}
                    onBackButtonPress={() => Navigation.goBack()}
                />
                <FormProvider
                    formID={ONYXKEYS.FORMS.MERGE_ACCOUNT_DETAILS_FORM}
                    onSubmit={(values) => {
                        MergeAccounts.requestValidationCodeForAccountMerge(values[INPUT_IDS.PHONE_OR_EMAIL]);
                    }}
                    submitButtonText={translate('common.next')}
                    style={[styles.flexGrow1, styles.mh5]}
                    shouldTrimValues
                    validate={validate}
                    isSubmitDisabled={!!mergeAccountData?.getValidateCodeForAccountMerge?.isLoading}
                    enabledWhenOffline={false}
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
                        />
                        <InputWrapper
                            style={[styles.mt6]}
                            InputComponent={CheckboxWithLabel}
                            inputID={INPUT_IDS.CONSENT}
                            label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')}
                            aria-label={translate('mergeAccountsPage.accountDetails.notReversibleConsent')}
                        />
                    </View>
                </FormProvider>
            </DelegateNoAccessWrapper>
        </ScreenWrapper>
    );
}

AccountDetailsPage.displayName = 'AccountDetailsPage';

export default AccountDetailsPage;
