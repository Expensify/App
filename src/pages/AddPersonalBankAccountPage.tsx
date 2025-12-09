import React, {useCallback, useContext, useEffect, useState} from 'react';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {addPersonalBankAccount, clearPersonalBankAccount, validatePlaidSelection} from '@userActions/BankAccounts';
import {continueSetup} from '@userActions/PaymentMethods';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

function AddPersonalBankAccountPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedPlaidAccountId, setSelectedPlaidAccountId] = useState('');
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {canBeMissing: true});
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA, {canBeMissing: true});
    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const topmostFullScreenRoute = navigationRef.current?.getRootState()?.routes.findLast((route) => isFullScreenName(route.name));
    const kycWallRef = useContext(KYCWallContext);

    const goBack = useCallback(() => {
        switch (topmostFullScreenRoute?.name) {
            case NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR:
                Navigation.goBack(ROUTES.SETTINGS_WALLET);
                break;
            case NAVIGATORS.REPORTS_SPLIT_NAVIGATOR:
                Navigation.closeRHPFlow();
                break;
            default:
                Navigation.goBack();
                break;
        }
    }, [topmostFullScreenRoute?.name]);

    const submitBankAccountForm = useCallback(() => {
        const bankAccounts = plaidData?.bankAccounts ?? [];
        const policyID = personalBankAccount?.policyID;
        const source = personalBankAccount?.source;

        const selectedPlaidBankAccount = bankAccounts.find((bankAccount) => bankAccount.plaidAccountID === selectedPlaidAccountId);

        if (selectedPlaidBankAccount) {
            const bankAccountWithToken = selectedPlaidBankAccount.plaidAccessToken
                ? selectedPlaidBankAccount
                : {
                      ...selectedPlaidBankAccount,
                      plaidAccessToken: plaidData?.plaidAccessToken ?? '',
                  };
            addPersonalBankAccount(bankAccountWithToken, policyID, source);
        }
    }, [plaidData?.bankAccounts, plaidData?.plaidAccessToken, selectedPlaidAccountId, personalBankAccount?.policyID, personalBankAccount?.source]);

    const exitFlow = useCallback(
        (shouldContinue = false) => {
            const exitReportID = personalBankAccount?.exitReportID;
            const onSuccessFallbackRoute = personalBankAccount?.onSuccessFallbackRoute ?? '';

            if (exitReportID) {
                Navigation.dismissModalWithReport({reportID: exitReportID});
            } else if (shouldContinue && onSuccessFallbackRoute) {
                continueSetup(kycWallRef, onSuccessFallbackRoute);
            } else {
                goBack();
            }
        },
        [personalBankAccount?.exitReportID, personalBankAccount?.onSuccessFallbackRoute, goBack, kycWallRef],
    );

    useEffect(() => clearPersonalBankAccount, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={shouldShowSuccess}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={AddPersonalBankAccountPage.displayName}
        >
            <FullPageNotFoundView>
                <HeaderWithBackButton
                    title={translate('bankAccount.addBankAccount')}
                    onBackButtonPress={shouldShowSuccess ? exitFlow : Navigation.goBack}
                />
                {shouldShowSuccess ? (
                    <ScrollView contentContainerStyle={styles.flexGrow1}>
                        <ConfirmationPage
                            heading={translate('addPersonalBankAccountPage.successTitle')}
                            description={translate('addPersonalBankAccountPage.successMessage')}
                            shouldShowButton
                            buttonText={translate('common.continue')}
                            onButtonPress={() => exitFlow(true)}
                            containerStyle={styles.h100}
                        />
                    </ScrollView>
                ) : (
                    <FormProvider
                        formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
                        isSubmitButtonVisible={(plaidData?.bankAccounts ?? []).length > 0}
                        submitButtonText={translate('common.saveAndContinue')}
                        scrollContextEnabled
                        onSubmit={submitBankAccountForm}
                        validate={validatePlaidSelection}
                        style={[styles.mh5, styles.flex1]}
                        shouldHideFixErrorsAlert
                    >
                        <InputWrapper
                            inputID={INPUT_IDS.BANK_INFO_STEP.SELECTED_PLAID_ACCOUNT_ID}
                            InputComponent={AddPlaidBankAccount}
                            onSelect={setSelectedPlaidAccountId}
                            text={translate('walletPage.chooseAccountBody')}
                            plaidData={plaidData}
                            isDisplayedInWalletFlow
                            onExitPlaid={Navigation.goBack}
                            receivedRedirectURI={getPlaidOAuthReceivedRedirectURI()}
                            selectedPlaidAccountID={selectedPlaidAccountId}
                        />
                    </FormProvider>
                )}
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}
AddPersonalBankAccountPage.displayName = 'AddPersonalBankAccountPage';

export default AddPersonalBankAccountPage;
