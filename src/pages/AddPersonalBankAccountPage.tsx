import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import ValidateCodeActionModal from '@components/ValidateCodeActionModal';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ErrorUtils from '@libs/ErrorUtils';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import Navigation from '@libs/Navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import * as User from '@userActions/User';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {PersonalBankAccount, PlaidData} from '@src/types/onyx';

type AddPersonalBankAccountPageWithOnyxProps = {
    /** Contains plaid data */
    plaidData: OnyxEntry<PlaidData>;

    /** The details about the Personal bank account we are adding saved in Onyx */
    personalBankAccount: OnyxEntry<PersonalBankAccount>;
};

function AddPersonalBankAccountPage({personalBankAccount, plaidData}: AddPersonalBankAccountPageWithOnyxProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedPlaidAccountId, setSelectedPlaidAccountId] = useState('');
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(!isUserValidated);
    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;

    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const primaryLogin = account?.primaryLogin;
    const loginData = loginList?.[primaryLogin ?? ''];
    const validateLoginError = ErrorUtils.getEarliestErrorField(loginData, 'validateLogin');

    const handleSubmitForm = useCallback(
        (submitCode: string) => {
            User.validateSecondaryLogin(loginList, primaryLogin ?? '', submitCode);
            Navigation.navigate(ROUTES.SETTINGS_ADD_BANK_ACCOUNT);
        },
        [loginList, primaryLogin],
    );

    const submitBankAccountForm = useCallback(() => {
        const bankAccounts = plaidData?.bankAccounts ?? [];
        const selectedPlaidBankAccount = bankAccounts.find((bankAccount) => bankAccount.plaidAccountID === selectedPlaidAccountId);

        if (selectedPlaidBankAccount) {
            BankAccounts.addPersonalBankAccount(selectedPlaidBankAccount);
        }
    }, [plaidData, selectedPlaidAccountId]);

    const exitFlow = useCallback(
        (shouldContinue = false) => {
            const exitReportID = personalBankAccount?.exitReportID;
            const onSuccessFallbackRoute = personalBankAccount?.onSuccessFallbackRoute ?? '';

            if (exitReportID) {
                Navigation.dismissModal(exitReportID);
            } else if (shouldContinue && onSuccessFallbackRoute) {
                PaymentMethods.continueSetup(onSuccessFallbackRoute);
            } else {
                Navigation.goBack();
            }
        },
        [personalBankAccount],
    );

    useEffect(() => BankAccounts.clearPersonalBankAccount, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={shouldShowSuccess}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={AddPersonalBankAccountPage.displayName}
        >
            {isUserValidated && (
                <FullPageNotFoundView>
                    <HeaderWithBackButton
                        title={translate('bankAccount.addBankAccount')}
                        onBackButtonPress={exitFlow}
                    />
                    {shouldShowSuccess ? (
                        <ConfirmationPage
                            heading={translate('addPersonalBankAccountPage.successTitle')}
                            description={translate('addPersonalBankAccountPage.successMessage')}
                            shouldShowButton
                            buttonText={translate('common.continue')}
                            onButtonPress={() => exitFlow(true)}
                        />
                    ) : (
                        <FormProvider
                            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
                            isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
                            submitButtonText={translate('common.saveAndContinue')}
                            scrollContextEnabled
                            onSubmit={submitBankAccountForm}
                            validate={BankAccounts.validatePlaidSelection}
                            style={[styles.mh5, styles.flex1]}
                        >
                            <InputWrapper
                                inputID={INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID}
                                InputComponent={AddPlaidBankAccount}
                                onSelect={setSelectedPlaidAccountId}
                                text={translate('walletPage.chooseAccountBody')}
                                plaidData={plaidData}
                                isDisplayedInWalletFlow
                                onExitPlaid={() => Navigation.goBack()}
                                receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                                selectedPlaidAccountID={selectedPlaidAccountId}
                            />
                        </FormProvider>
                    )}
                </FullPageNotFoundView>
            )}
            <ValidateCodeActionModal
                validatePendingAction={loginList?.[primaryLogin ?? '-1']?.pendingFields?.validateLogin}
                validateError={validateLoginError}
                isVisible={isValidateCodeActionModalVisible}
                title={translate('contacts.validateAccount')}
                description={translate('contacts.featureRequiresValidate')}
                onClose={() => {
                    setIsValidateCodeActionModalVisible(false);
                    exitFlow();
                }}
                handleSubmitForm={handleSubmitForm}
                clearError={() => {}}
            />
        </ScreenWrapper>
    );
}
AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';

export default withOnyx<AddPersonalBankAccountPageWithOnyxProps, AddPersonalBankAccountPageWithOnyxProps>({
    // @ts-expect-error: ONYXKEYS.PERSONAL_BANK_ACCOUNT is conflicting with ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM
    personalBankAccount: {
        key: ONYXKEYS.PERSONAL_BANK_ACCOUNT,
    },
    plaidData: {
        key: ONYXKEYS.PLAID_DATA,
    },
})(AddPersonalBankAccountPage);
