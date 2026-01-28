import React, {useCallback, useContext, useEffect} from 'react';
import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {KYCWallContext} from '@components/KYCWall/KYCWallContext';
import ScreenWrapper from '@components/ScreenWrapper';
import ScrollView from '@components/ScrollView';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useThemeStyles from '@hooks/useThemeStyles';
import {isFullScreenName} from '@libs/Navigation/helpers/isNavigatorName';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {clearPersonalBankAccount} from '@userActions/BankAccounts';
import {continueSetup} from '@userActions/PaymentMethods';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import PersonalInfoPage from './settings/Wallet/InternationalDepositAccount/PersonalInfo/PersonalInfo';

function AddPersonalBankAccountPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT, {canBeMissing: true});
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

    if (shouldShowSuccess) {
        return (
            <ScreenWrapper
                includeSafeAreaPaddingBottom={shouldShowSuccess}
                shouldEnablePickerAvoiding={false}
                shouldShowOfflineIndicator={false}
                testID="AddPersonalBankAccountPage"
            >
                <FullPageNotFoundView>
                    <HeaderWithBackButton
                        title={translate('bankAccount.addBankAccount')}
                        onBackButtonPress={shouldShowSuccess ? exitFlow : Navigation.goBack}
                    />
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
                </FullPageNotFoundView>
            </ScreenWrapper>
        );
    }

    return <PersonalInfoPage />;
}

export default AddPersonalBankAccountPage;
