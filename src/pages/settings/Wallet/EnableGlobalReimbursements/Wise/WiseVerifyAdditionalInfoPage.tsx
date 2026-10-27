import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useThemeStyles from '@hooks/useThemeStyles';

import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect, useState} from 'react';

import WiseKYCReviewOverlay from './WiseKYCReviewOverlay';

type WiseVerifyAdditionalInfoPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_VERIFY_ADDITIONAL_INFO>;

/** Tells the admin the rest of the onboarding happens on Wise's page, then opens it */
function WiseVerifyAdditionalInfoPage({route}: WiseVerifyAdditionalInfoPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const bankAccount = bankAccountList?.[bankAccountID];
    const [isWisePageVisible, setIsWisePageVisible] = useState(false);

    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);
    const styles = useThemeStyles();
    const illustrations = useMemoizedLazyIllustrations(['UserShield']);

    const goBackToWallet = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    // Close the page instead of showing "not found" when the user lacks the beta. Wait for betas to load first
    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToWallet();
    }, [isWiseReimbursementsBetaEnabled, goBackToWallet]);

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it
    const isWaitingForBankAccount = !bankAccount && !!isLoadingPaymentMethods;

    if (isLoadingOnyxValue(bankAccountListMetadata) || isWaitingForBankAccount || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper testID="WiseVerifyAdditionalInfoPage">
            <FullPageNotFoundView
                shouldShow={!bankAccount}
                onBackButtonPress={goBackToWallet}
            >
                <Header>
                    <Header.BackButton onPress={goBackToWallet} />
                    <Header.Title title={translate('walletPage.wiseKYCReview.headerTitle')} />
                </Header>
                <ConfirmationPage
                    illustration={illustrations.UserShield}
                    heading={translate('walletPage.wiseKYCReview.title')}
                    description={translate('walletPage.wiseKYCReview.subtitle')}
                    descriptionStyle={styles.textSupporting}
                    shouldShowButton
                    buttonText={translate('common.continue')}
                    onButtonPress={() => setIsWisePageVisible(true)}
                />
                <WiseKYCReviewOverlay
                    bankAccountID={bankAccountID}
                    isVisible={isWisePageVisible}
                    onClose={() => setIsWisePageVisible(false)}
                    onDone={() => {
                        setIsWisePageVisible(false);
                        Navigation.navigate(ROUTES.SETTINGS_WALLET_WISE_IN_REVIEW.getRoute(bankAccountID), {forceReplace: true});
                    }}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseVerifyAdditionalInfoPage;
