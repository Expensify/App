import React, {useCallback, useEffect, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import AddPlaidBankAccount from '@components/AddPlaidBankAccount';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import getPlaidOAuthReceivedRedirectURI from '@libs/getPlaidOAuthReceivedRedirectURI';
import Navigation from '@libs/Navigation/Navigation';
import * as BankAccounts from '@userActions/BankAccounts';
import * as PaymentMethods from '@userActions/PaymentMethods';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

function AddPersonalBankAccountPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [selectedPlaidAccountId, setSelectedPlaidAccountId] = useState('');
    const [isUserValidated] = useOnyx(ONYXKEYS.USER, {selector: (user) => !!user?.validated});
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const [plaidData] = useOnyx(ONYXKEYS.PLAID_DATA);
    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const topMostCentralPane = Navigation.getTopMostCentralPaneRouteFromRootState();

    const goBack = useCallback(() => {
        switch (topMostCentralPane?.name) {
            case SCREENS.SETTINGS.WALLET.ROOT:
                Navigation.goBack(ROUTES.SETTINGS_WALLET, true);
                break;
            case SCREENS.REPORT:
                Navigation.closeRHPFlow();
                break;
            default:
                Navigation.goBack();
                break;
        }
    }, [topMostCentralPane]);

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
                goBack();
            }
        },
        [personalBankAccount, goBack],
    );

    useEffect(() => BankAccounts.clearPersonalBankAccount, []);

    return (
        <ScreenWrapper
            includeSafeAreaPaddingBottom={shouldShowSuccess}
            shouldEnablePickerAvoiding={false}
            shouldShowOfflineIndicator={false}
            testID={AddPersonalBankAccountPage.displayName}
        >
            <FullPageNotFoundView shouldShow={!isUserValidated}>
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
                            onExitPlaid={goBack}
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
