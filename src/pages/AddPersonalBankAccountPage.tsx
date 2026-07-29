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
import type PersonalBankAccount from '@src/types/onyx/PersonalBankAccount';

import React, {useContext, useEffect, useRef} from 'react';

import PersonalInfoPage from './settings/Wallet/InternationalDepositAccount/PersonalInfo/PersonalInfo';

function AddPersonalBankAccountPage() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const [personalBankAccount] = useOnyx(ONYXKEYS.PERSONAL_BANK_ACCOUNT);
    const shouldShowSuccess = personalBankAccount?.shouldShowSuccess ?? false;
    const topmostFullScreenRoute = navigationRef.current?.getRootState()?.routes.findLast((route) => isFullScreenName(route.name));
    const kycWallRef = useContext(KYCWallContext);
    const flowRoutingDataRef = useRef<Partial<PersonalBankAccount> | undefined>(undefined);
    const hasExitedFlowRef = useRef(false);

    const goBack = () => {
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
    };

    const exitFlow = (shouldContinue = false) => {
        const exitReportID = personalBankAccount?.exitReportID;
        const onSuccessFallbackRoute = personalBankAccount?.onSuccessFallbackRoute ?? '';

        if (exitReportID) {
            Navigation.dismissModalWithReport({reportID: exitReportID});
        } else if (shouldContinue && onSuccessFallbackRoute) {
            continueSetup(kycWallRef, onSuccessFallbackRoute);
        } else {
            hasExitedFlowRef.current = true;
            flowRoutingDataRef.current = undefined;
            goBack();
            clearPersonalBankAccount();
        }
    };

    useEffect(() => {
        if (hasExitedFlowRef.current) {
            return;
        }
        const {onSuccessFallbackRoute, exitReportID} = personalBankAccount ?? {};
        flowRoutingDataRef.current = !onSuccessFallbackRoute && !exitReportID ? undefined : {onSuccessFallbackRoute, exitReportID};
    });

    // Where the flow continues once an account is added is seeded by its entry point (e.g. Pay > KYC), not by this form,
    // so tearing the form down when the user leaves mid-setup must keep it for when they come back and finish.
    useEffect(() => () => clearPersonalBankAccount(flowRoutingDataRef.current), []);

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
