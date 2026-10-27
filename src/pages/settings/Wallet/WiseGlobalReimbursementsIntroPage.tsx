import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import FixedFooter from '@components/FixedFooter';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import useDynamicBackPath from '@hooks/useDynamicBackPath';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {dismissProductTraining} from '@libs/actions/Welcome';
import {isBankAccountEligibleForGlobalReimbursements} from '@libs/BankAccountUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import {DYNAMIC_ROUTES} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';

type WiseGlobalReimbursementsIntroPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.DYNAMIC_WISE_GLOBAL_REIMBURSEMENTS_INTRO>;

function WiseGlobalReimbursementsIntroPage({route}: WiseGlobalReimbursementsIntroPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const backPath = useDynamicBackPath(DYNAMIC_ROUTES.WISE_GLOBAL_REIMBURSEMENTS_INTRO.path);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const [isLoadingPaymentMethods = true] = useOnyx(ONYXKEYS.IS_LOADING_PAYMENT_METHODS);
    const bankAccount = bankAccountList?.[bankAccountID];

    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['EarthWithCoins']);

    const goBackToEntryPoint = () => Navigation.goBack(backPath);

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
                shouldShow={!isBankAccountEligibleForGlobalReimbursements(bankAccount?.accountData, bankAccount?.bankCurrency)}
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
                        <ConfirmationPage.Description style={styles.textSupporting}>{translate('walletPage.wiseGlobalReimbursementsIntro.subtitle')}</ConfirmationPage.Description>
                    </ConfirmationPage.Content>
                    <FixedFooter>
                        <ConfirmationPage.SecondaryButton
                            text={translate('common.notNow')}
                            onPress={goBackToEntryPoint}
                        />
                        <ConfirmationPage.PrimaryButton
                            text={translate('walletPage.wiseGlobalReimbursementsIntro.getStarted')}
                            onPress={() => {
                                // Starting onboarding for any account retires both banners for good
                                dismissProductTraining(CONST.WISE_GLOBAL_REIMBURSEMENTS_WALLET_BANNER);
                                dismissProductTraining(CONST.WISE_GLOBAL_REIMBURSEMENTS_WORKSPACE_BANNER);
                            }}
                        />
                    </FixedFooter>
                </ConfirmationPage>
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseGlobalReimbursementsIntroPage;
