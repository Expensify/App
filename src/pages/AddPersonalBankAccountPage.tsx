import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx, withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
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
    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const [isValidateCodeActionModalVisible, setIsValidateCodeActionModalVisible] = useState(false);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [loginList] = useOnyx(ONYXKEYS.LOGIN_LIST);
    const validateLoginError = ErrorUtils.getLatestErrorField(loginList?.[account?.primaryLogin ?? ''], 'validateLogin');

    const handleSubmitForm = useCallback(
        (validateCode: string) => {
            User.validateSecondaryLogin(loginList, account?.primaryLogin ?? '', validateCode);
        },
        [loginList, account],
    );

    useEffect(() => {
        if (!isUserValidated && !isValidateCodeActionModalVisible) {
            setIsValidateCodeActionModalVisible(true);
        }
        if (isUserValidated && isValidateCodeActionModalVisible) {
            setIsValidateCodeActionModalVisible(false);
        }
    }, [isUserValidated, isValidateCodeActionModalVisible]);

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
            <HeaderWithBackButton
                title={translate('bankAccount.addBankAccount')}
                onBackButtonPress={exitFlow}
            />
            {isUserValidated &&
                (shouldShowSuccess ? (
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
                ))}
            <ValidateCodeActionModal
                handleSubmitForm={handleSubmitForm}
                clearError={() => User.clearContactMethodErrors(account?.primaryLogin ?? '', 'validateLogin')}
                onClose={() => {
                    setIsValidateCodeActionModalVisible(false);
                }}
                onModalHide={() => Navigation.dismissModal()}
                validateError={validateLoginError}
                isVisible={isValidateCodeActionModalVisible}
                title={translate('cardPage.validateCardTitle')}
                description={translate('cardPage.enterMagicCode', {contactMethod: account?.primaryLogin ?? ''})}
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
