import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import ScreenWrapper from '@components/ScreenWrapper';
import {useMemoizedLazyIllustrations} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';

function MultifactorAuthenticationBiometricsTestPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();
    const illustrations = useMemoizedLazyIllustrations(['OpenPadlock'] as const);

    return (
        <ScreenWrapper testID={MultifactorAuthenticationBiometricsTestPage.displayName}>
            <HeaderWithBackButton
                title={translate('multifactorAuthentication.biometricsTest.biometricsTest')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={styles.flex1}>
                    <BlockingView
                        icon={illustrations.OpenPadlock}
                        contentFitImage="fill"
                        iconWidth={variables.openPadlockWidth}
                        iconHeight={variables.openPadlockHeight}
                        title={translate('multifactorAuthentication.biometricsTest.biometricsTest')}
                        containerStyle={styles.p1}
                        testID={MultifactorAuthenticationBiometricsTestPage.displayName}
                    />
                </View>
                <View style={[styles.flexRow, styles.m5]}>
                    <Button
                        success
                        style={styles.flex1}
                        onPress={() => {
                            // Temporary navigation, expected behavior: run the Multifactor Authentication Biometrics Test flow
                            Navigation.navigate(ROUTES.MULTIFACTOR_AUTHENTICATION_MAGIC_CODE);
                        }}
                        text={translate('multifactorAuthentication.biometricsTest.test')}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MultifactorAuthenticationBiometricsTestPage.displayName = 'MultifactorAuthenticationBiometricsTestPage';

export default MultifactorAuthenticationBiometricsTestPage;
