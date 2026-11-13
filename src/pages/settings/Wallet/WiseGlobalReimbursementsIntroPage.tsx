import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useOpenReimbursementAccountPageForWiseIntro from '@hooks/useOpenReimbursementAccountPageForWiseIntro';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isBankAccountEligibleForGlobalReimbursements, isWiseOnboardingPendingSubmit, isWiseOnboardingSubmitted} from '@libs/BankAccountUtils';
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import {isWiseGlobalReimbursementsIntroOverPayReportScreen} from '@libs/Navigation/helpers/enableGlobalReimbursementsNavigationUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import variables from '@styles/variables';

import {dismissWiseGlobalReimbursementsBanners} from '@userActions/WiseOnboarding';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect} from 'react';

type WiseGlobalReimbursementsIntroPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO>;

function WiseGlobalReimbursementsIntroPage({route}: WiseGlobalReimbursementsIntroPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path);
    const isPayingReport = isWiseGlobalReimbursementsIntroOverPayReportScreen(backPath);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const bankAccount = bankAccountList?.[bankAccountID];
    const isOnboardingSubmitted = isWiseOnboardingSubmitted(bankAccount?.accountData);

    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['EarthWithCoins']);

    const goBackToEntryPoint = () => Navigation.goBack(backPath);

    const {isOffline} = useNetwork();
    const isEligible = isBankAccountEligibleForGlobalReimbursements(bankAccount?.accountData, bankAccount?.bankCurrency);
    // The intro stays mounted under the form on a direct link to the form, which reads for itself
    const isFocused = useIsFocused();
    useOpenReimbursementAccountPageForWiseIntro(bankAccountID, isFocused && isEligible && !isOffline && !isOnboardingSubmitted && !!isWiseReimbursementsBetaEnabled);

    // Close the page instead of showing "not found" when the user lacks the beta. Wait for betas to load first
    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        goBackToEntryPoint();
    }, [isWiseReimbursementsBetaEnabled, goBackToEntryPoint]);

    // On a cold direct link the account list can be empty until the payment-method fetch finishes, so wait for it before judging eligibility
    const isWaitingForBankAccount = !bankAccount && !!isLoadingPaymentMethods;

    if (isLoadingOnyxValue(bankAccountListMetadata) || isWaitingForBankAccount || !isWiseReimbursementsBetaEnabled) {
        return <FullScreenLoadingIndicator shouldUseGoBackButton />;
    }

    return (
        <ScreenWrapper testID="WiseGlobalReimbursementsIntroPage">
            <FullPageNotFoundView
                shouldShow={!isEligible}
                onBackButtonPress={goBackToEntryPoint}
            >
                <Header>
                    <Header.BackButton onPress={goBackToEntryPoint} />
                    <Header.Title title={translate('walletPage.wiseGlobalReimbursementsIntro.headerTitle')} />
                </Header>
                <ConfirmationPage>
                    <ConfirmationPage.Content>
                        <ConfirmationPage.Illustration
                            illustration={illustrations.EarthWithCoins}
                            illustrationStyle={StyleUtils.getWidthAndHeightStyle(variables.wiseGlobalReimbursementsIntroIllustrationSize)}
                        />
                        <ConfirmationPage.Heading>{translate('walletPage.wiseGlobalReimbursementsIntro.title')}</ConfirmationPage.Heading>
                        <ConfirmationPage.Description style={styles.textSupporting}>
                            {translate(isPayingReport ? 'walletPage.wiseGlobalReimbursementsIntro.payingReportSubtitle' : 'walletPage.wiseGlobalReimbursementsIntro.subtitle')}
                        </ConfirmationPage.Description>
                    </ConfirmationPage.Content>
                    <FixedFooter>
                        <ConfirmationPage.SecondaryButton
                            sentryLabel={CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_INTRO_NOT_NOW}
                            text={translate('common.notNow')}
                            onPress={goBackToEntryPoint}
                        />
                        <ConfirmationPage.PrimaryButton
                            sentryLabel={
                                isOnboardingSubmitted
                                    ? CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_INTRO_PRIMARY_ACTION.ONBOARDING_STATUS
                                    : CONST.SENTRY_LABEL.SETTINGS_WALLET.WISE_INTRO_PRIMARY_ACTION.ONBOARDING
                            }
                            text={translate(isOnboardingSubmitted || isWiseOnboardingPendingSubmit(bankAccount) ? 'common.continue' : 'walletPage.wiseGlobalReimbursementsIntro.getStarted')}
                            onPress={() => {
                                // A submitted business goes to its status page, which leaves the banners alone, so they are dismissed here. The form dismisses them itself
                                if (isOnboardingSubmitted) {
                                    dismissWiseGlobalReimbursementsBanners();
                                    Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_ONBOARDING_STATUS.path));
                                    return;
                                }
                                Navigation.navigate(createDynamicRoute(DYNAMIC_ROUTES.WISE_BUSINESS_ONBOARDING.getRoute()));
                            }}
                        />
                    </FixedFooter>
                </ConfirmationPage>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseGlobalReimbursementsIntroPage;
