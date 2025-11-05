import React from 'react';
import {View} from 'react-native';
import BlockingView from '@components/BlockingViews/BlockingView';
import FullPageOfflineBlockingView from '@components/BlockingViews/FullPageOfflineBlockingView';
import Button from '@components/Button';
import HeaderWithBackButton from '@components/HeaderWithBackButton';
import * as Illustrations from '@components/Icon/Illustrations';
import {useMultifactorAuthenticationContext} from '@components/MultifactorAuthenticationContext';
import ScreenWrapper from '@components/ScreenWrapper';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import Navigation from '@libs/Navigation/Navigation';
import variables from '@styles/variables';
import CONST from '@src/CONST';

function MFABiometricsTestPage() {
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const onGoBackPress = () => Navigation.dismissModal();
    const {process} = useMultifactorAuthenticationContext();

    return (
        <ScreenWrapper testID={MFABiometricsTestPage.displayName}>
            <HeaderWithBackButton
                title={translate('multiFactorAuthentication.biometrics.biometricsTest')}
                onBackButtonPress={onGoBackPress}
                shouldShowBackButton
            />
            <FullPageOfflineBlockingView>
                <View style={styles.flex1}>
                    <BlockingView
                        icon={Illustrations.OpenPadlock}
                        contentFitImage="fill"
                        iconWidth={variables.openPadlockWidth}
                        iconHeight={variables.openPadlockHeight}
                        title={translate('multiFactorAuthentication.biometrics.biometricsTest')}
                        containerStyle={styles.p1}
                        testID={MFABiometricsTestPage.displayName}
                    />
                </View>
                <View style={[styles.flexRow, styles.m5]}>
                    <Button
                        success
                        style={styles.flex1}
                        onPress={() => {
                            process(CONST.MULTI_FACTOR_AUTHENTICATION.SCENARIO.AUTHORIZE_TRANSACTION, {transactionID: 'fake'});
                        }}
                        text={translate('common.test')}
                    />
                </View>
            </FullPageOfflineBlockingView>
        </ScreenWrapper>
    );
}

MFABiometricsTestPage.displayName = 'MFABiometricsTestPage';

export default MFABiometricsTestPage;
