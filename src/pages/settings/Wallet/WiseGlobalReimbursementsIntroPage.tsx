import FullPageNotFoundView from '@components/BlockingViews/FullPageNotFoundView';
import ConfirmationPage from '@components/ConfirmationPage';
import Header from '@components/Header';
import ScreenWrapper from '@components/ScreenWrapper';

import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {isEligibleForWiseGlobalReimbursements} from '@libs/BankAccountUtils';
import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';

import Navigation from '@navigation/Navigation';
import type {SettingsNavigatorParamList} from '@navigation/types';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

import React, {useEffect} from 'react';

type WiseGlobalReimbursementsIntroPageProps = PlatformStackScreenProps<SettingsNavigatorParamList, typeof SCREENS.SETTINGS.WALLET.WISE_GLOBAL_REIMBURSEMENTS_INTRO>;

function WiseGlobalReimbursementsIntroPage({route}: WiseGlobalReimbursementsIntroPageProps) {
    const bankAccountID = Number(route.params.bankAccountID);
    const [bankAccountList, bankAccountListMetadata] = useOnyx(ONYXKEYS.BANK_ACCOUNT_LIST);
    const bankAccount = bankAccountList?.[bankAccountID];

    const {translate} = useLocalize();
    const {isBetaEnabledOrUnknown} = usePermissions();
    const isWiseReimbursementsBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.WISE_REIMBURSEMENTS);
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const illustrations = useMemoizedLazyIllustrations(['EarthWithCoins']);

    const goBackToWallet = () => Navigation.goBack(ROUTES.SETTINGS_WALLET);

    // Close the page instead of showing "not found" when the user lacks the beta. Wait for betas to load first
    useEffect(() => {
        if (isWiseReimbursementsBetaEnabled !== false) {
            return;
        }
        Navigation.goBack(ROUTES.SETTINGS_WALLET);
    }, [isWiseReimbursementsBetaEnabled]);

    if (isLoadingOnyxValue(bankAccountListMetadata) || !isWiseReimbursementsBetaEnabled) {
        return null;
    }

    return (
        <ScreenWrapper testID="WiseGlobalReimbursementsIntroPage">
            <FullPageNotFoundView
                shouldShow={!isEligibleForWiseGlobalReimbursements(bankAccount?.accountData)}
                onBackButtonPress={goBackToWallet}
            >
                <Header>
                    <Header.BackButton onPress={goBackToWallet} />
                    <Header.Title title={translate('common.enableGlobalReimbursements')} />
                </Header>
                <ConfirmationPage
                    illustration={illustrations.EarthWithCoins}
                    illustrationStyle={StyleUtils.getWidthAndHeightStyle(variables.wiseGlobalReimbursementsIntroIllustrationSize)}
                    heading={translate('walletPage.wiseGlobalReimbursementsIntro.title')}
                    description={translate('walletPage.wiseGlobalReimbursementsIntro.subtitle')}
                    descriptionStyle={styles.textSupporting}
                    shouldShowSecondaryButton
                    secondaryButtonText={translate('common.notNow')}
                    onSecondaryButtonPress={goBackToWallet}
                    shouldShowButton
                    buttonText={translate('walletPage.wiseGlobalReimbursementsIntro.getStarted')}
                    // TODO: Navigate to the next Wise onboarding step once it exists
                    onButtonPress={() => {}}
                />
            </FullPageNotFoundView>
        </ScreenWrapper>
    );
}

export default WiseGlobalReimbursementsIntroPage;
