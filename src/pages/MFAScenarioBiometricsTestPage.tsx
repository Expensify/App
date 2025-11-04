import React, {useCallback} from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import ROUTES from '@src/ROUTES';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';

function MFAScenarioBiometricsTestPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();
    const isBiometryAvailable = false; // TODO: remove -> BIOMETRY WRAPPER WILL HANDLE IT

    // TODO: replace with the correct logic
    const testBiometrics = useCallback(() => {
        if (isBiometryAvailable) {
            return;
        }
        Navigation.navigate(ROUTES.MULTIFACTORAUTHENTICATION_PROMPT.getRoute('enable-biometrics'));
    }, [isBiometryAvailable]);

    return (
        <ScreenWrapper testID={MFAScenarioBiometricsTestPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.biometricsTest')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={[styles.flex1]}>
                    <BlockingView
                        icon={Illustrations.OpenPadlock}
                        contentFitImage="fill"
                        iconWidth={variables.openPadlockWidth}
                        iconHeight={variables.openPadlockHeight}
                        title={translate('multiFactorAuthentication.biometrics.biometricsTest')}
                        containerStyle={styles.p1}
                        testID={MFAScenarioBiometricsTestPage.displayName}
                    />
                </View>
                <View style={[styles.flexRow, styles.m5]}>
                    <Button
                        success
                        style={[styles.flex1]}
                        onPress={testBiometrics}
                        text={translate('common.test')}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFAScenarioBiometricsTestPage.displayName = 'MFAScenarioBiometricsTestPage';

export default MFAScenarioBiometricsTestPage;
