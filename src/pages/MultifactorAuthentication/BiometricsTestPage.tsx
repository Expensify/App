import React, {useEffect} from 'react';
import {InteractionManager} from 'react-native';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import FullScreenLoadingIndicator from '@components/FullscreenLoadingIndicator';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import {useMultifactorAuthentication} from '@components/MultifactorAuthentication/Context';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';

function MultifactorAuthenticationBiometricsTestPage() {
    const {executeScenario} = useMultifactorAuthentication();
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    useEffect(() => {
        if (isOffline) {
            return;
        }

        // The reason for using it, despite it being deprecated: https://github.com/Expensify/App/pull/79473/files#r2745847379
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => executeScenario(CONST.MULTIFACTOR_AUTHENTICATION.SCENARIO.BIOMETRICS_TEST));

        // This should only fire once - on mount, or if the user switches from offline to online.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline]);

    return (
        <ScreenWrapper testID={MultifactorAuthenticationBiometricsTestPage.displayName}>
            {/*
                The back button needs to be displayed when the user is offline so they can exit the offline page,
                and not get stuck there. If they are online, they will simply be redirected to the next flow page.
            */}
            {isOffline && (
                <HeaderWithBackButton
                    title={translate('multifactorAuthentication.letsVerifyItsYou')}
                    onBackButtonPress={Navigation.closeRHPFlow}
                    shouldShowBackButton
                />
            )}
            <FullPageOfflineBlockingView>
                <FullScreenLoadingIndicator />
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationBiometricsTestPage.displayName = 'MultifactorAuthenticationBiometricsTestPage';

export default MultifactorAuthenticationBiometricsTestPage;
